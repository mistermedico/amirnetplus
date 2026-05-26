import Foundation

// MARK: - Chapter

struct Chapter: Codable, Identifiable {
    var id: UUID = UUID()
    var title: String
    var description: String = ""
    var topicID: TopicID
    var questionIDs: [UUID] = []
    var order: Int = 0
    var createdAt: Date = Date()

    var questionCount: Int { questionIDs.count }
}

// MARK: - Exam Template

struct ExamTemplate: Codable, Identifiable {
    var id: UUID = UUID()
    var title: String
    var description: String = ""
    var chapterIDs: [UUID] = []
    var additionalQuestionIDs: [UUID] = []
    var questionCount: Int = 30
    var durationMinutes: Int = 60
    var passingScore: Int = 70
    var isActive: Bool = true
    var allowAllTopics: Bool = true
    var topicIDs: [String] = []
    var createdAt: Date = Date()
}

// MARK: - Question Performance (for Adaptive)

struct QuestionPerformance: Codable {
    var timesAnswered: Int = 0
    var timesCorrect: Int = 0
    var lastAnswered: Date? = nil

    var accuracy: Double {
        guard timesAnswered > 0 else { return 0.5 }
        return Double(timesCorrect) / Double(timesAnswered)
    }
}

// MARK: - Adaptive Quiz Config

enum AdaptiveEndCondition: String, Codable {
    case questionCount = "questionCount"
    case confidence = "confidence"
}

struct AdaptiveConfig {
    var maxQuestions: Int = 20
    var topicID: TopicID? = nil
    var endCondition: AdaptiveEndCondition = .questionCount
    var includeCustom: Bool = true
}
