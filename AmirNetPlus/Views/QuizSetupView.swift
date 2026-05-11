import SwiftUI

struct QuizConfig {
    var questionCount: Int
    var topic: TopicID?
    var mode: QuizMode
}

enum QuizMode {
    case study    // show answer after each question
    case exam     // show results at end

    var displayName: String {
        switch self {
        case .study: return "מצב לימוד"
        case .exam: return "מצב בחינה"
        }
    }
}

struct QuizSetupView: View {
    @State private var selectedCount: Int = 10
    @State private var selectedTopic: TopicID? = nil
    @State private var selectedMode: QuizMode = .exam
    @State private var showQuiz = false

    private let countOptions = [10, 20, 30, 50]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    headerCard
                    questionCountSection
                    topicSection
                    modeSection
                    startButton
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("הגדרות בחינה")
            .navigationBarTitleDisplayMode(.large)
            .fullScreenCover(isPresented: $showQuiz) {
                QuizFlowView(config: QuizConfig(
                    questionCount: selectedCount,
                    topic: selectedTopic,
                    mode: selectedMode
                ))
            }
        }
    }

    private var headerCard: some View {
        HStack {
            Spacer()
            VStack(alignment: .trailing, spacing: 6) {
                Text("בחינת אמירנט")
                    .font(.title2.bold())
                Text("הגדר את הבחינה שלך והתחל להתכונן")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.trailing)
            }
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 48))
                .foregroundStyle(.blue.opacity(0.8))
        }
        .padding()
        .background(
            LinearGradient(colors: [.blue.opacity(0.08), .indigo.opacity(0.08)],
                           startPoint: .leading, endPoint: .trailing),
            in: RoundedRectangle(cornerRadius: 16)
        )
    }

    private var questionCountSection: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SectionHeader(title: "מספר שאלות")
            HStack(spacing: 10) {
                ForEach(countOptions, id: \.self) { count in
                    Button {
                        selectedCount = count
                    } label: {
                        Text("\(count)")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(selectedCount == count ? Color.blue : Color(.systemFill),
                                        in: RoundedRectangle(cornerRadius: 10))
                            .foregroundStyle(selectedCount == count ? .white : .primary)
                    }
                }
            }
        }
    }

    private var topicSection: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SectionHeader(title: "נושא")
            VStack(spacing: 8) {
                TopicOptionRow(
                    title: "כל הנושאים",
                    subtitle: "שאלות מעורבות מכל הנושאים",
                    icon: "square.grid.2x2.fill",
                    color: .blue,
                    isSelected: selectedTopic == nil
                ) {
                    selectedTopic = nil
                }
                ForEach(TopicID.allCases, id: \.self) { topic in
                    TopicOptionRow(
                        title: topic.displayName,
                        subtitle: "\(QuestionsData.questions(for: topic).count) שאלות",
                        icon: topic.icon,
                        color: colorFromString(topic.color),
                        isSelected: selectedTopic == topic
                    ) {
                        selectedTopic = topic
                    }
                }
            }
        }
    }

    private var modeSection: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SectionHeader(title: "מצב בחינה")
            HStack(spacing: 10) {
                ModeButton(
                    mode: .exam,
                    icon: "clock.fill",
                    description: "ראה תוצאות בסוף",
                    isSelected: selectedMode == .exam
                ) { selectedMode = .exam }

                ModeButton(
                    mode: .study,
                    icon: "lightbulb.fill",
                    description: "ראה תשובה אחרי כל שאלה",
                    isSelected: selectedMode == .study
                ) { selectedMode = .study }
            }
        }
    }

    private var startButton: some View {
        Button {
            showQuiz = true
        } label: {
            HStack {
                Spacer()
                Image(systemName: "play.fill")
                Text("התחל בחינה")
                    .font(.headline)
                Spacer()
            }
            .foregroundStyle(.white)
            .padding(.vertical, 16)
            .background(
                LinearGradient(colors: [.blue, .indigo], startPoint: .leading, endPoint: .trailing),
                in: RoundedRectangle(cornerRadius: 14)
            )
        }
        .padding(.top, 4)
    }
}

struct TopicOptionRow: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.blue)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text(title)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(.primary)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                ZStack {
                    Circle()
                        .fill(color.opacity(0.12))
                        .frame(width: 38, height: 38)
                    Image(systemName: icon)
                        .foregroundStyle(color)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(
                isSelected ? Color.blue.opacity(0.08) : Color(.background),
                in: RoundedRectangle(cornerRadius: 12)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.blue.opacity(0.4) : .clear, lineWidth: 1.5)
            )
        }
    }
}

struct ModeButton: View {
    let mode: QuizMode
    let icon: String
    let description: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundStyle(isSelected ? .blue : .secondary)
                Text(mode.displayName)
                    .font(.subheadline.bold())
                    .foregroundStyle(isSelected ? .blue : .primary)
                Text(description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(
                isSelected ? Color.blue.opacity(0.08) : Color(.background),
                in: RoundedRectangle(cornerRadius: 14)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isSelected ? Color.blue.opacity(0.4) : .clear, lineWidth: 1.5)
            )
        }
    }
}

#Preview {
    QuizSetupView()
        .environment(UserProgress())
}
