import Foundation

enum TopicID: String, Codable, CaseIterable {
    case networking = "networking"
    case security = "security"
    case operatingSystems = "operatingSystems"
    case cloud = "cloud"
    case itManagement = "itManagement"
    case protocols = "protocols"

    var displayName: String {
        switch self {
        case .networking: return "רשתות תקשורת"
        case .security: return "אבטחת מידע"
        case .operatingSystems: return "מערכות הפעלה"
        case .cloud: return "ענן ווירטואליזציה"
        case .itManagement: return "ניהול IT"
        case .protocols: return "פרוטוקולים"
        }
    }

    var icon: String {
        switch self {
        case .networking: return "network"
        case .security: return "lock.shield"
        case .operatingSystems: return "desktopcomputer"
        case .cloud: return "cloud"
        case .itManagement: return "person.3"
        case .protocols: return "arrow.left.arrow.right"
        }
    }

    var color: String {
        switch self {
        case .networking: return "blue"
        case .security: return "red"
        case .operatingSystems: return "green"
        case .cloud: return "cyan"
        case .itManagement: return "orange"
        case .protocols: return "purple"
        }
    }

    var description: String {
        switch self {
        case .networking: return "מודל OSI, TCP/IP, ניתוב רשתות ו-Subnetting"
        case .security: return "חומות אש, הצפנה, VPN ואיומי סייבר"
        case .operatingSystems: return "Windows Server, Linux וניהול שרתים"
        case .cloud: return "AWS, Azure, VMware ווירטואליזציה"
        case .itManagement: return "ITIL, ניהול שינויים ותהליכי IT"
        case .protocols: return "HTTP, DNS, DHCP, FTP ופרוטוקולים נוספים"
        }
    }
}

enum Difficulty: String, Codable {
    case easy = "easy"
    case medium = "medium"
    case hard = "hard"

    var displayName: String {
        switch self {
        case .easy: return "קל"
        case .medium: return "בינוני"
        case .hard: return "קשה"
        }
    }
}

struct Question: Identifiable, Codable {
    let id: UUID
    let questionText: String
    let options: [String]
    let correctIndex: Int
    let explanation: String
    let topic: TopicID
    let difficulty: Difficulty

    init(id: UUID? = nil, questionText: String, options: [String], correctIndex: Int, explanation: String, topic: TopicID, difficulty: Difficulty) {
        self.id = id ?? Self.stableID(
            questionText: questionText,
            options: options,
            correctIndex: correctIndex,
            explanation: explanation,
            topic: topic,
            difficulty: difficulty
        )
        self.questionText = questionText
        self.options = options
        self.correctIndex = correctIndex
        self.explanation = explanation
        self.topic = topic
        self.difficulty = difficulty
    }

    private static func stableID(
        questionText: String,
        options: [String],
        correctIndex: Int,
        explanation: String,
        topic: TopicID,
        difficulty: Difficulty
    ) -> UUID {
        let source = [
            topic.rawValue,
            difficulty.rawValue,
            questionText,
            options.joined(separator: "\u{1F}"),
            String(correctIndex),
            explanation
        ].joined(separator: "\u{1E}")

        let high = fnv1a64(source)
        let low = fnv1a64("amirnetplus|" + source)

        var bytes = [UInt8]()
        for value in [high, low] {
            bytes.append(UInt8((value >> 56) & 0xff))
            bytes.append(UInt8((value >> 48) & 0xff))
            bytes.append(UInt8((value >> 40) & 0xff))
            bytes.append(UInt8((value >> 32) & 0xff))
            bytes.append(UInt8((value >> 24) & 0xff))
            bytes.append(UInt8((value >> 16) & 0xff))
            bytes.append(UInt8((value >> 8) & 0xff))
            bytes.append(UInt8(value & 0xff))
        }

        bytes[6] = (bytes[6] & 0x0f) | 0x50
        bytes[8] = (bytes[8] & 0x3f) | 0x80

        return UUID(uuid: (
            bytes[0], bytes[1], bytes[2], bytes[3],
            bytes[4], bytes[5], bytes[6], bytes[7],
            bytes[8], bytes[9], bytes[10], bytes[11],
            bytes[12], bytes[13], bytes[14], bytes[15]
        ))
    }

    private static func fnv1a64(_ string: String) -> UInt64 {
        var hash: UInt64 = 0xcbf29ce484222325
        for byte in string.utf8 {
            hash ^= UInt64(byte)
            hash &*= 0x100000001b3
        }
        return hash
    }
}

struct QuizSession {
    let questions: [Question]
    var currentIndex: Int = 0
    var selectedAnswers: [Int: Int] = [:]
    var startTime: Date = Date()
    var endTime: Date?

    var currentQuestion: Question? {
        guard currentIndex < questions.count else { return nil }
        return questions[currentIndex]
    }

    var isFinished: Bool { currentIndex >= questions.count }

    var score: Int {
        questions.enumerated().filter { idx, q in
            selectedAnswers[idx] == q.correctIndex
        }.count
    }

    var percentage: Double {
        guard !questions.isEmpty else { return 0 }
        return Double(score) / Double(questions.count) * 100
    }

    var duration: TimeInterval { (endTime ?? Date()).timeIntervalSince(startTime) }

    var topicIDForHistory: String? {
        guard let firstTopic = questions.first?.topic else { return nil }
        return questions.allSatisfy { $0.topic == firstTopic } ? firstTopic.rawValue : nil
    }

    mutating func answer(_ optionIndex: Int) {
        guard currentIndex < questions.count else { return }
        selectedAnswers[currentIndex] = optionIndex
    }

    mutating func next() {
        guard currentIndex < questions.count else { return }
        currentIndex += 1
    }

    mutating func finish() {
        endTime = endTime ?? Date()
    }
}
