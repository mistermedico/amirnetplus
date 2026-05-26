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
    var chapterID: UUID?
    var examIDs: [UUID]
    var tags: [String]

    init(id: UUID = UUID(), questionText: String, options: [String], correctIndex: Int,
         explanation: String, topic: TopicID, difficulty: Difficulty,
         chapterID: UUID? = nil, examIDs: [UUID] = [], tags: [String] = []) {
        self.id = id
        self.questionText = questionText
        self.options = options
        self.correctIndex = correctIndex
        self.explanation = explanation
        self.topic = topic
        self.difficulty = difficulty
        self.chapterID = chapterID
        self.examIDs = examIDs
        self.tags = tags
    }
}

struct QuizSession {
    let questions: [Question]
    var currentIndex: Int = 0
    var selectedAnswers: [Int: Int] = [:]
    var startTime: Date = Date()

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

    var duration: TimeInterval { Date().timeIntervalSince(startTime) }

    mutating func answer(_ optionIndex: Int) {
        selectedAnswers[currentIndex] = optionIndex
    }

    mutating func next() {
        currentIndex += 1
    }
}
