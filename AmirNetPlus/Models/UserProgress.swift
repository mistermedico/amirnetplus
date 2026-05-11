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

@Observable
class UserProgress {
    private static let saveKey = "userProgress_v1"

    var totalAnswered: Int = 0
    var totalCorrect: Int = 0
    var topicProgress: [String: TopicProgress] = [:]
    var streakDays: Int = 0
    var lastStudyDate: Date?
    var dailyActivity: [DailyActivity] = []
    var unlockedAchievements: Set<String> = []

    var overallPercentage: Double {
        guard totalAnswered > 0 else { return 0 }
        return Double(totalCorrect) / Double(totalAnswered) * 100
    }

    init() {
        load()
        updateStreak()
    }

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

        recordDailyActivity(answered: session.questions.count, correct: session.score)
        updateStreak()
        checkAchievements()
        save()
    }

    private func recordDailyActivity(answered: Int, correct: Int) {
        let today = Calendar.current.startOfDay(for: Date())
        if let idx = dailyActivity.firstIndex(where: { Calendar.current.isDate($0.date, inSameDayAs: today) }) {
            dailyActivity[idx].questionsAnswered += answered
            dailyActivity[idx].correctAnswers += correct
        } else {
            dailyActivity.append(DailyActivity(date: today, questionsAnswered: answered, correctAnswers: correct))
        }
        // Keep last 30 days only
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
            // Same day, streak unchanged
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
    }

    // MARK: - Persistence

    private func save() {
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

    init(from progress: UserProgress) {
        totalAnswered = progress.totalAnswered
        totalCorrect = progress.totalCorrect
        topicProgress = progress.topicProgress
        streakDays = progress.streakDays
        lastStudyDate = progress.lastStudyDate
        dailyActivity = progress.dailyActivity
        unlockedAchievements = progress.unlockedAchievements
    }
}
