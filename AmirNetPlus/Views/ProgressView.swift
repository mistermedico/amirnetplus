import SwiftUI
import Charts

struct StudyProgressView: View {
    @Environment(UserProgress.self) private var progress

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    overallCard
                    activityChart
                    topicBreakdown
                    achievementsSection
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("התקדמות")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    // MARK: - Overall Card
    private var overallCard: some View {
        VStack(spacing: 16) {
            HStack {
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text("סה\"כ התקדמות")
                        .font(.headline)
                    Text("\(progress.totalAnswered) שאלות נענו")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                ZStack {
                    Circle()
                        .stroke(Color(.systemFill), lineWidth: 10)
                        .frame(width: 80, height: 80)
                    Circle()
                        .trim(from: 0, to: progress.overallPercentage / 100)
                        .stroke(overallColor, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                        .frame(width: 80, height: 80)
                        .animation(.easeOut(duration: 1), value: progress.overallPercentage)
                    Text("\(Int(progress.overallPercentage))%")
                        .font(.callout.bold())
                        .foregroundStyle(overallColor)
                }
            }

            HStack(spacing: 0) {
                overallStat(value: "\(progress.totalCorrect)", label: "נכון", color: .green)
                Divider().frame(height: 40)
                overallStat(value: "\(progress.totalAnswered - progress.totalCorrect)", label: "שגוי", color: .red)
                Divider().frame(height: 40)
                overallStat(value: "\(progress.streakDays)", label: "ימי רצף", color: .orange)
            }
        }
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 6, y: 2)
    }

    private var overallColor: Color {
        progress.overallPercentage >= 80 ? .green : (progress.overallPercentage >= 60 ? .orange : .red)
    }

    private func overallStat(value: String, label: String, color: Color) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.title3.bold())
                .foregroundStyle(color)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Activity Chart
    private var activityChart: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SectionHeader(title: "פעילות אחרונה (30 ימים)")
            if progress.dailyActivity.isEmpty {
                emptyChartPlaceholder
            } else {
                Chart(progress.dailyActivity) { day in
                    BarMark(
                        x: .value("תאריך", day.date, unit: .day),
                        y: .value("שאלות", day.questionsAnswered)
                    )
                    .foregroundStyle(Color.blue.gradient)
                    .cornerRadius(4)
                }
                .frame(height: 150)
                .chartXAxis {
                    AxisMarks(values: .stride(by: .day, count: 7)) { value in
                        AxisGridLine()
                        AxisValueLabel(format: .dateTime.day().month())
                    }
                }
                .chartYAxis {
                    AxisMarks(position: .trailing)
                }
            }
        }
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 6, y: 2)
    }

    private var emptyChartPlaceholder: some View {
        VStack(spacing: 8) {
            Image(systemName: "chart.bar.xaxis")
                .font(.largeTitle)
                .foregroundStyle(.tertiary)
            Text("עדיין אין נתוני פעילות")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Text("השתמש בבחינות כדי לצבור נתונים")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .frame(height: 120)
        .frame(maxWidth: .infinity)
    }

    // MARK: - Topic Breakdown
    private var topicBreakdown: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SectionHeader(title: "פירוט לפי נושא")
            ForEach(TopicID.allCases, id: \.self) { topic in
                let tp = progress.topicProgress[topic.rawValue]
                TopicBreakdownRow(topic: topic, progress: tp)
            }
        }
    }

    // MARK: - Achievements
    private var achievementsSection: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SectionHeader(title: "הישגים")
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(Achievement.all, id: \.id) { achievement in
                    AchievementCell(
                        achievement: achievement,
                        isUnlocked: progress.unlockedAchievements.contains(achievement.id)
                    )
                }
            }
        }
    }
}

struct TopicBreakdownRow: View {
    let topic: TopicID
    let progress: TopicProgress?

    private var percentage: Double { progress?.percentage ?? 0 }
    private var answered: Int { progress?.answeredCount ?? 0 }
    private var correct: Int { progress?.correctCount ?? 0 }
    private var topicColor: Color { colorFromString(topic.color) }
    private let totalQuestions: Int

    init(topic: TopicID, progress: TopicProgress?) {
        self.topic = topic
        self.progress = progress
        self.totalQuestions = QuestionsData.questions(for: topic).count
    }

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                HStack(spacing: 4) {
                    if answered > 0 {
                        Text("\(Int(percentage))%")
                            .font(.caption.bold())
                            .foregroundStyle(percentage >= 70 ? .green : .orange)
                    }
                    Text("\(answered)/\(totalQuestions)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                HStack(spacing: 8) {
                    Text(topic.displayName)
                        .font(.subheadline.weight(.medium))
                    Image(systemName: topic.icon)
                        .foregroundStyle(topicColor)
                        .frame(width: 20)
                }
            }
            ProgressView(value: answered > 0 ? percentage : 0, total: 100)
                .tint(topicColor)
        }
        .padding(12)
        .background(.background, in: RoundedRectangle(cornerRadius: 12))
    }
}

struct Achievement: Identifiable {
    let id: String
    let title: String
    let description: String
    let icon: String
    let color: Color

    static let all: [Achievement] = [
        Achievement(id: "first_10", title: "מתחיל", description: "ענה על 10 שאלות", icon: "star.fill", color: .yellow),
        Achievement(id: "fifty_questions", title: "חצי מאה", description: "ענה על 50 שאלות", icon: "50.circle.fill", color: .blue),
        Achievement(id: "century", title: "מאה!", description: "ענה על 100 שאלות", icon: "rosette", color: .purple),
        Achievement(id: "high_scorer", title: "ציון גבוה", description: "80%+ ב-20 שאלות", icon: "trophy.fill", color: .orange),
        Achievement(id: "streak_3", title: "3 ימי רצף", description: "למד 3 ימים ברצף", icon: "flame.fill", color: .red),
        Achievement(id: "streak_7", title: "שבוע רצף", description: "למד 7 ימים ברצף", icon: "flame.circle.fill", color: .orange),
    ]
}

struct AchievementCell: View {
    let achievement: Achievement
    let isUnlocked: Bool

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: achievement.icon)
                .font(.title2)
                .foregroundStyle(isUnlocked ? achievement.color : .secondary.opacity(0.4))
            Text(achievement.title)
                .font(.caption.bold())
                .foregroundStyle(isUnlocked ? .primary : .secondary)
            Text(achievement.description)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(
            isUnlocked ? achievement.color.opacity(0.1) : Color(.systemFill),
            in: RoundedRectangle(cornerRadius: 14)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(isUnlocked ? achievement.color.opacity(0.3) : .clear, lineWidth: 1)
        )
        .opacity(isUnlocked ? 1 : 0.5)
    }
}

#Preview {
    StudyProgressView()
        .environment(UserProgress())
}
