import SwiftUI

struct HomeView: View {
    @Environment(UserProgress.self) private var progress
    @State private var showQuiz = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    headerSection
                    statsSection
                    streakSection
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

    private var headerSection: some View {
        VStack(alignment: .trailing, spacing: 4) {
            HStack {
                Image(systemName: "network")
                    .font(.title2)
                    .foregroundStyle(.blue)
                Spacer()
                VStack(alignment: .trailing) {
                    Text("AmirNet Plus")
                        .font(.title.bold())
                    Text("הכנה לבחינת אמירנט")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.top, 8)
        }
    }

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
        }
    }

    private var coveredTopicsCount: Int {
        TopicID.allCases.filter { topic in
            (progress.topicProgress[topic.rawValue]?.answeredCount ?? 0) > 0
        }.count
    }

    private var streakSection: some View {
        HStack(spacing: 16) {
            Image(systemName: "flame.fill")
                .font(.title2)
                .foregroundStyle(.orange)
            VStack(alignment: .leading, spacing: 2) {
                Text("\(progress.streakDays) ימי רצף")
                    .font(.headline)
                Text("המשך ללמוד כדי לשמור על הרצף!")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding()
        .background(.orange.opacity(0.1), in: RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(.orange.opacity(0.3), lineWidth: 1))
    }

    private var quickActionsSection: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SectionHeader(title: "פעולות מהירות")
            Button {
                showQuiz = true
            } label: {
                HStack {
                    Spacer()
                    Text("התחל בחינה מהירה (10 שאלות)")
                        .font(.headline)
                        .foregroundStyle(.white)
                    Image(systemName: "play.fill")
                        .foregroundStyle(.white)
                }
                .padding()
                .background(
                    LinearGradient(colors: [.blue, .indigo], startPoint: .leading, endPoint: .trailing),
                    in: RoundedRectangle(cornerRadius: 14)
                )
            }
        }
    }

    private var topicsOverviewSection: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SectionHeader(title: "סקירת נושאים")
            ForEach(TopicID.allCases, id: \.self) { topic in
                TopicProgressRow(topic: topic, progress: progress.topicProgress[topic.rawValue])
            }
        }
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
                .font(.title3)
                .foregroundStyle(color)
            Text(value)
                .font(.title2.bold())
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
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
                    .font(.caption)
                    .foregroundStyle(.secondary)
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
                        .fill(Color(.systemFill))
                        .frame(height: 6)
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
                .font(.headline)
                .foregroundStyle(.primary)
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
    HomeView()
        .environment(UserProgress())
}
