import Foundation
import Observation

struct TopicProgress: Codable {
    var answeredCount: Int = 0
    var correctCount: Int = 0

    var percentage: Double {
        guard answeredCount > 0 else { return 0 }
        return Double(correctCount) / Double(answeredCount) * 100
    }
}

struct DailyActivity: Codable, Identifiable {
    var id: Date { date }
    let date: Date
    var questionsAnswered: Int
    var correctAnswers: Int
}

struct StudyPlan: Codable, Identifiable {
    var id: UUID = UUID()
    var title: String
    var targetDate: Date
    var topicIDs: [String]
    var dailyGoal: Int
    var createdAt: Date = Date()
    var isActive: Bool = true

    var daysRemaining: Int {
        max(0, Calendar.current.dateComponents([.day], from: Date(), to: targetDate).day ?? 0)
    }
}

struct QuizHistoryEntry: Codable, Identifiable {
    var id: UUID = UUID()
    var date: Date
    var score: Int
    var total: Int
    var topicID: String?
    var durationSeconds: Double

    var percentage: Double {
        guard total > 0 else { return 0 }
        return Double(score) / Double(total) * 100
    }
}

struct CustomQuestion: Codable, Identifiable {
    var id: UUID = UUID()
    var questionText: String
    var options: [String]
    var correctIndex: Int
    var explanation: String
    var topic: TopicID
    var difficulty: Difficulty
    var createdAt: Date = Date()

    func toQuestion() -> Question {
        Question(id: id, questionText: questionText, options: options,
                 correctIndex: correctIndex, explanation: explanation,
                 topic: topic, difficulty: difficulty)
    }
}

@Observable
class UserProgress {
    private static let saveKey = "userProgress_v2"

    // Core stats
    var totalAnswered: Int = 0
    var totalCorrect: Int = 0
    var topicProgress: [String: TopicProgress] = [:]
    var streakDays: Int = 0
    var lastStudyDate: Date?
    var dailyActivity: [DailyActivity] = []
    var unlockedAchievements: Set<String> = []

    // Management features
    var bookmarkedQuestionIDs: Set<UUID> = []
    var customQuestions: [CustomQuestion] = []
    var studyPlans: [StudyPlan] = []
    var quizHistory: [QuizHistoryEntry] = []
    var notes: [UUID: String] = [:]
    var weakTopics: [String] = []
    var dailyGoal: Int = 20
    var notificationsEnabled: Bool = true
    var userName: String = ""

    var overallPercentage: Double {
        guard totalAnswered > 0 else { return 0 }
        return Double(totalCorrect) / Double(totalAnswered) * 100
    }

    var todayAnswered: Int {
        let today = Calendar.current.startOfDay(for: Date())
        return dailyActivity.first(where: { Calendar.current.isDate($0.date, inSameDayAs: today) })?.questionsAnswered ?? 0
    }

    var activeStudyPlan: StudyPlan? {
        studyPlans.first(where: { $0.isActive })
    }

    init() {
        load()
        updateStreak()
        recalculateWeakTopics()
    }

    // MARK: - Quiz Recording

    func recordQuizSession(_ session: QuizSession) {
        totalAnswered += session.questions.count
        totalCorrect += session.score

        for (idx, question) in session.questions.enumerated() {
            let key = question.topic.rawValue
            var progress = topicProgress[key] ?? TopicProgress()
            progress.answeredCount += 1
            if session.selectedAnswers[idx] == question.correctIndex {
                progress.correctCount += 1
            }
            topicProgress[key] = progress
        }

        let entry = QuizHistoryEntry(
            date: session.startTime,
            score: session.score,
            total: session.questions.count,
            topicID: session.questions.first?.topic.rawValue,
            durationSeconds: session.duration
        )
        quizHistory.insert(entry, at: 0)
        if quizHistory.count > 200 { quizHistory = Array(quizHistory.prefix(200)) }

        recordDailyActivity(answered: session.questions.count, correct: session.score)
        updateStreak()
        checkAchievements()
        recalculateWeakTopics()
        save()
    }

    // MARK: - Bookmarks

    func toggleBookmark(questionID: UUID) {
        if bookmarkedQuestionIDs.contains(questionID) {
            bookmarkedQuestionIDs.remove(questionID)
        } else {
            bookmarkedQuestionIDs.insert(questionID)
        }
        save()
    }

    func isBookmarked(_ questionID: UUID) -> Bool {
        bookmarkedQuestionIDs.contains(questionID)
    }

    var bookmarkedQuestions: [Question] {
        QuestionsData.all.filter { bookmarkedQuestionIDs.contains($0.id) } +
        customQuestions.filter { bookmarkedQuestionIDs.contains($0.id) }.map { $0.toQuestion() }
    }

    // MARK: - Custom Questions

    func addCustomQuestion(_ q: CustomQuestion) {
        customQuestions.insert(q, at: 0)
        save()
    }

    func updateCustomQuestion(_ q: CustomQuestion) {
        if let idx = customQuestions.firstIndex(where: { $0.id == q.id }) {
            customQuestions[idx] = q
            save()
        }
    }

    func deleteCustomQuestion(id: UUID) {
        customQuestions.removeAll { $0.id == id }
        bookmarkedQuestionIDs.remove(id)
        notes.removeValue(forKey: id)
        save()
    }

    // MARK: - Notes

    func setNote(_ text: String, for questionID: UUID) {
        notes[questionID] = text.isEmpty ? nil : text
        save()
    }

    // MARK: - Study Plans

    func addStudyPlan(_ plan: StudyPlan) {
        studyPlans.insert(plan, at: 0)
        save()
    }

    func updateStudyPlan(_ plan: StudyPlan) {
        if let idx = studyPlans.firstIndex(where: { $0.id == plan.id }) {
            studyPlans[idx] = plan
            save()
        }
    }

    func deleteStudyPlan(id: UUID) {
        studyPlans.removeAll { $0.id == id }
        save()
    }

    func activateStudyPlan(id: UUID) {
        for idx in studyPlans.indices { studyPlans[idx].isActive = false }
        if let idx = studyPlans.firstIndex(where: { $0.id == id }) {
            studyPlans[idx].isActive = true
        }
        save()
    }

    // MARK: - Settings

    func updateSettings(dailyGoal: Int, notifications: Bool, userName: String) {
        self.dailyGoal = dailyGoal
        self.notificationsEnabled = notifications
        self.userName = userName
        save()
    }

    func resetProgress() {
        totalAnswered = 0
        totalCorrect = 0
        topicProgress = [:]
        streakDays = 0
        lastStudyDate = nil
        dailyActivity = []
        unlockedAchievements = []
        quizHistory = []
        weakTopics = []
        save()
    }

    // MARK: - Private Helpers

    private func recordDailyActivity(answered: Int, correct: Int) {
        let today = Calendar.current.startOfDay(for: Date())
        if let idx = dailyActivity.firstIndex(where: { Calendar.current.isDate($0.date, inSameDayAs: today) }) {
            dailyActivity[idx].questionsAnswered += answered
            dailyActivity[idx].correctAnswers += correct
        } else {
            dailyActivity.append(DailyActivity(date: today, questionsAnswered: answered, correctAnswers: correct))
        }
        dailyActivity = dailyActivity.suffix(30)
    }

    private func updateStreak() {
        let today = Calendar.current.startOfDay(for: Date())
        guard let last = lastStudyDate else {
            lastStudyDate = today
            streakDays = 0
            return
        }
        let lastDay = Calendar.current.startOfDay(for: last)
        let diff = Calendar.current.dateComponents([.day], from: lastDay, to: today).day ?? 0
        if diff == 0 {
        } else if diff == 1 {
            streakDays += 1
            lastStudyDate = today
        } else {
            streakDays = 0
            lastStudyDate = today
        }
    }

    private func checkAchievements() {
        if totalAnswered >= 10 { unlockedAchievements.insert("first_10") }
        if totalAnswered >= 50 { unlockedAchievements.insert("fifty_questions") }
        if totalAnswered >= 100 { unlockedAchievements.insert("century") }
        if overallPercentage >= 80 && totalAnswered >= 20 { unlockedAchievements.insert("high_scorer") }
        if streakDays >= 3 { unlockedAchievements.insert("streak_3") }
        if streakDays >= 7 { unlockedAchievements.insert("streak_7") }
        if !customQuestions.isEmpty { unlockedAchievements.insert("first_custom") }
        if !studyPlans.isEmpty { unlockedAchievements.insert("planner") }
    }

    private func recalculateWeakTopics() {
        weakTopics = TopicID.allCases
            .compactMap { topic -> (String, Double)? in
                let p = topicProgress[topic.rawValue]
                guard let p, p.answeredCount >= 3, p.percentage < 70 else { return nil }
                return (topic.rawValue, p.percentage)
            }
            .sorted { $0.1 < $1.1 }
            .map { $0.0 }
    }

    // MARK: - Persistence

    func save() {
        if let data = try? JSONEncoder().encode(ProgressData(from: self)) {
            UserDefaults.standard.set(data, forKey: Self.saveKey)
        }
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: Self.saveKey),
              let saved = try? JSONDecoder().decode(ProgressData.self, from: data) else { return }
        totalAnswered = saved.totalAnswered
        totalCorrect = saved.totalCorrect
        topicProgress = saved.topicProgress
        streakDays = saved.streakDays
        lastStudyDate = saved.lastStudyDate
        dailyActivity = saved.dailyActivity
        unlockedAchievements = saved.unlockedAchievements
        bookmarkedQuestionIDs = saved.bookmarkedQuestionIDs
        customQuestions = saved.customQuestions
        studyPlans = saved.studyPlans
        quizHistory = saved.quizHistory
        notes = saved.notes
        weakTopics = saved.weakTopics
        dailyGoal = saved.dailyGoal
        notificationsEnabled = saved.notificationsEnabled
        userName = saved.userName
    }
}

private struct ProgressData: Codable {
    var totalAnswered: Int
    var totalCorrect: Int
    var topicProgress: [String: TopicProgress]
    var streakDays: Int
    var lastStudyDate: Date?
    var dailyActivity: [DailyActivity]
    var unlockedAchievements: Set<String>
    var bookmarkedQuestionIDs: Set<UUID>
    var customQuestions: [CustomQuestion]
    var studyPlans: [StudyPlan]
    var quizHistory: [QuizHistoryEntry]
    var notes: [UUID: String]
    var weakTopics: [String]
    var dailyGoal: Int
    var notificationsEnabled: Bool
    var userName: String

    init(from p: UserProgress) {
        totalAnswered = p.totalAnswered
        totalCorrect = p.totalCorrect
        topicProgress = p.topicProgress
        streakDays = p.streakDays
        lastStudyDate = p.lastStudyDate
        dailyActivity = p.dailyActivity
        unlockedAchievements = p.unlockedAchievements
        bookmarkedQuestionIDs = p.bookmarkedQuestionIDs
        customQuestions = p.customQuestions
        studyPlans = p.studyPlans
        quizHistory = p.quizHistory
        notes = p.notes
        weakTopics = p.weakTopics
        dailyGoal = p.dailyGoal
        notificationsEnabled = p.notificationsEnabled
        userName = p.userName
    }
}
