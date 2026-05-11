import SwiftUI

struct HomeView: View {
    @Environment(UserProgress.self) private var progress
    @State private var showQuiz = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    headerSection
                    dailyGoalSection
                    statsSection
                    streakSection
                    if !progress.weakTopics.isEmpty {
                        weakTopicsSection
                    }
                    quickActionsSection
                    topicsOverviewSection
                }
                .padding(.horizontal)
                .padding(.bottom, 20)
            }
            .background(Color(.systemGroupedBackground))
            .navigationBarHidden(true)
        }
        .fullScreenCover(isPresented: $showQuiz) {
            QuizFlowView(config: QuizConfig(questionCount: 10, topic: nil, mode: .exam))
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        HStack {
            Image(systemName: "network")
                .font(.title2)
                .foregroundStyle(.blue)
            Spacer()
            VStack(alignment: .trailing) {
                Text(progress.userName.isEmpty ? "AmirNet Plus" : "שלום, \(progress.userName)")
                    .font(.title.bold())
                Text("הכנה לבחינת אמירנט")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.top, 8)
    }

    // MARK: - Daily Goal

    private var dailyGoalSection: some View {
        let today = progress.todayAnswered
        let goal = progress.dailyGoal
        let done = today >= goal

        return VStack(alignment: .trailing, spacing: 8) {
            HStack {
                HStack(spacing: 4) {
                    Text("\(today)/\(goal)")
                        .font(.callout.bold())
                        .foregroundStyle(done ? .green : .blue)
                    Text("שאלות היום")
                        .font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                Text(done ? "יעד יומי הושג! 🎯" : "יעד יומי")
                    .font(.caption.bold())
                    .foregroundStyle(done ? .green : .primary)
            }
            ProgressView(value: Double(min(today, goal)), total: Double(goal))
                .tint(done ? .green : .blue)
        }
        .padding()
        .background(done ? Color.green.opacity(0.08) : Color(.background), in: RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(done ? .green.opacity(0.3) : .clear, lineWidth: 1))
        .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
    }

    // MARK: - Stats

    private var statsSection: some View {
        HStack(spacing: 12) {
            StatCard(
                value: "\(progress.totalAnswered)",
                label: "שאלות",
                icon: "questionmark.circle.fill",
                color: .blue
            )
            StatCard(
                value: progress.totalAnswered > 0 ? "\(Int(progress.overallPercentage))%" : "-",
                label: "הצלחה",
                icon: "checkmark.seal.fill",
                color: progress.overallPercentage >= 70 ? .green : .orange
            )
            StatCard(
                value: "\(coveredTopicsCount)",
                label: "נושאים",
                icon: "books.vertical.fill",
                color: .purple
            )
            StatCard(
                value: "\(progress.bookmarkedQuestionIDs.count)",
                label: "שמורות",
                icon: "bookmark.fill",
                color: .orange
            )
        }
    }

    private var coveredTopicsCount: Int {
        TopicID.allCases.filter { (progress.topicProgress[$0.rawValue]?.answeredCount ?? 0) > 0 }.count
    }

    // MARK: - Streak

    private var streakSection: some View {
        HStack(spacing: 16) {
            Image(systemName: "flame.fill")
                .font(.title2).foregroundStyle(.orange)
            VStack(alignment: .leading, spacing: 2) {
                Text("\(progress.streakDays) ימי רצף")
                    .font(.headline)
                Text(progress.streakDays > 0 ? "כל הכבוד! המשך לשמור על הרצף" : "התחל לימוד היום!")
                    .font(.caption).foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding()
        .background(.orange.opacity(0.1), in: RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(.orange.opacity(0.3), lineWidth: 1))
    }

    // MARK: - Weak Topics Alert

    private var weakTopicsSection: some View {
        VStack(alignment: .trailing, spacing: 10) {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundStyle(.orange)
                Spacer()
                Text("נושאים לחיזוק")
                    .font(.headline)
            }
            ForEach(progress.weakTopics.prefix(2), id: \.self) { topicRaw in
                if let topic = TopicID(rawValue: topicRaw),
                   let tp = progress.topicProgress[topicRaw] {
                    HStack {
                        Text("\(Int(tp.percentage))%")
                            .font(.caption.bold()).foregroundStyle(.orange)
                        ProgressView(value: tp.percentage, total: 100).tint(.orange)
                        Spacer()
                        HStack(spacing: 4) {
                            Text(topic.displayName).font(.caption)
                            Image(systemName: topic.icon).font(.caption)
                                .foregroundStyle(colorFromString(topic.color))
                        }
                    }
                }
            }
        }
        .padding()
        .background(.orange.opacity(0.07), in: RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(.orange.opacity(0.2), lineWidth: 1))
    }

    // MARK: - Quick Actions

    private var quickActionsSection: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SectionHeader(title: "פעולות מהירות")
            HStack(spacing: 10) {
                QuickActionButton(
                    title: "בחינה מהירה",
                    subtitle: "10 שאלות",
                    icon: "play.fill",
                    color: .blue
                ) { showQuiz = true }

                if !progress.weakTopics.isEmpty,
                   let firstWeak = progress.weakTopics.first,
                   let topic = TopicID(rawValue: firstWeak) {
                    NavigationLink(destination: TopicDetailView(topic: topic)) {
                        QuickActionContent(
                            title: "חזק חולשות",
                            subtitle: topic.displayName,
                            icon: "exclamationmark.triangle.fill",
                            color: .orange
                        )
                    }
                    .buttonStyle(.plain)
                }

                NavigationLink(destination: BookmarksView()) {
                    QuickActionContent(
                        title: "שמורות",
                        subtitle: "\(progress.bookmarkedQuestionIDs.count) שאלות",
                        icon: "bookmark.fill",
                        color: .orange
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Topics Overview

    private var topicsOverviewSection: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SectionHeader(title: "סקירת נושאים")
            ForEach(TopicID.allCases, id: \.self) { topic in
                TopicProgressRow(topic: topic, progress: progress.topicProgress[topic.rawValue])
            }
        }
    }
}

// MARK: - Supporting Views

struct QuickActionButton: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            QuickActionContent(title: title, subtitle: subtitle, icon: icon, color: color)
        }
        .buttonStyle(.plain)
    }
}

struct QuickActionContent: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3).foregroundStyle(color)
            Text(title)
                .font(.caption.bold())
            Text(subtitle)
                .font(.caption2).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(color.opacity(0.08), in: RoundedRectangle(cornerRadius: 12))
    }
}

struct StatCard: View {
    let value: String
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3).foregroundStyle(color)
            Text(value)
                .font(.title2.bold())
            Text(label)
                .font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(.background, in: RoundedRectangle(cornerRadius: 14))
        .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
    }
}

struct TopicProgressRow: View {
    let topic: TopicID
    let progress: TopicProgress?

    private var percentage: Double { progress?.percentage ?? 0 }
    private var answered: Int { progress?.answeredCount ?? 0 }
    private var topicColor: Color { colorFromString(topic.color) }

    var body: some View {
        VStack(alignment: .trailing, spacing: 8) {
            HStack {
                Text("\(answered) שאלות")
                    .font(.caption).foregroundStyle(.secondary)
                Spacer()
                HStack(spacing: 8) {
                    Text(topic.displayName)
                        .font(.subheadline.weight(.medium))
                    Image(systemName: topic.icon)
                        .foregroundStyle(topicColor)
                }
            }
            GeometryReader { geo in
                ZStack(alignment: .trailing) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color(.systemFill)).frame(height: 6)
                    RoundedRectangle(cornerRadius: 4)
                        .fill(topicColor)
                        .frame(width: geo.size.width * percentage / 100, height: 6)
                }
            }
            .frame(height: 6)
        }
        .padding(12)
        .background(.background, in: RoundedRectangle(cornerRadius: 12))
    }
}

struct SectionHeader: View {
    let title: String
    var body: some View {
        HStack {
            Spacer()
            Text(title)
                .font(.headline).foregroundStyle(.primary)
        }
    }
}

func colorFromString(_ name: String) -> Color {
    switch name {
    case "blue": return .blue
    case "red": return .red
    case "green": return .green
    case "cyan": return .cyan
    case "orange": return .orange
    case "purple": return .purple
    default: return .blue
    }
}

#Preview {
    HomeView().environment(UserProgress())
}
