import SwiftUI

struct TopicsView: View {
    @Environment(UserProgress.self) private var progress

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 14) {
                    ForEach(TopicID.allCases, id: \.self) { topic in
                        NavigationLink(destination: TopicDetailView(topic: topic)) {
                            TopicCard(
                                topic: topic,
                                progress: progress.topicProgress[topic.rawValue],
                                totalQuestions: QuestionsData.questions(for: topic).count
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("נושאים")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}

struct TopicCard: View {
    let topic: TopicID
    let progress: TopicProgress?
    let totalQuestions: Int

    private var percentage: Double { progress?.percentage ?? 0 }
    private var answered: Int { progress?.answeredCount ?? 0 }
    private var topicColor: Color { colorFromString(topic.color) }

    var body: some View {
        VStack(alignment: .trailing, spacing: 12) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(answered)/\(totalQuestions) שאלות")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    if percentage > 0 {
                        Text("\(Int(percentage))% הצלחה")
                            .font(.caption.weight(.medium))
                            .foregroundStyle(percentage >= 70 ? .green : .orange)
                    }
                }
                Spacer()
                HStack(spacing: 12) {
                    VStack(alignment: .trailing, spacing: 4) {
                        Text(topic.displayName)
                            .font(.headline)
                            .foregroundStyle(.primary)
                        Text(topic.description)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.trailing)
                    }
                    ZStack {
                        Circle()
                            .fill(topicColor.opacity(0.15))
                            .frame(width: 48, height: 48)
                        Image(systemName: topic.icon)
                            .font(.title3)
                            .foregroundStyle(topicColor)
                    }
                }
            }

            ProgressView(value: percentage, total: 100)
                .tint(topicColor)
                .background(Color(.systemFill), in: RoundedRectangle(cornerRadius: 4))

            HStack {
                Image(systemName: "chevron.left")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
                Spacer()
                HStack(spacing: 4) {
                    difficultyBadge(.easy, count: easyCount)
                    difficultyBadge(.medium, count: mediumCount)
                    difficultyBadge(.hard, count: hardCount)
                }
            }
        }
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.06), radius: 6, y: 3)
    }

    private var easyCount: Int { QuestionsData.questions(for: topic).filter { $0.difficulty == .easy }.count }
    private var mediumCount: Int { QuestionsData.questions(for: topic).filter { $0.difficulty == .medium }.count }
    private var hardCount: Int { QuestionsData.questions(for: topic).filter { $0.difficulty == .hard }.count }

    private func difficultyBadge(_ difficulty: Difficulty, count: Int) -> some View {
        HStack(spacing: 2) {
            Text("\(count)")
                .font(.caption2.bold())
            Text(difficulty.displayName)
                .font(.caption2)
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 3)
        .background(difficultyColor(difficulty).opacity(0.15), in: Capsule())
        .foregroundStyle(difficultyColor(difficulty))
    }

    private func difficultyColor(_ d: Difficulty) -> Color {
        switch d {
        case .easy: return .green
        case .medium: return .orange
        case .hard: return .red
        }
    }
}

#Preview {
    TopicsView()
        .environment(UserProgress())
}
