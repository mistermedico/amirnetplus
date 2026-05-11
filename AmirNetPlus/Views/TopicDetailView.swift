import SwiftUI

struct TopicDetailView: View {
    let topic: TopicID
    @Environment(UserProgress.self) private var progress
    @State private var selectedFilter: Difficulty? = nil
    @State private var showQuiz = false
    @State private var currentCardIndex = 0
    @State private var showAnswer = false
    @State private var mode: ViewMode = .flashcards

    enum ViewMode { case flashcards, list }

    private var questions: [Question] {
        let all = QuestionsData.questions(for: topic)
        if let filter = selectedFilter {
            return all.filter { $0.difficulty == filter }
        }
        return all
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                topicHeader
                modePicker
                filterRow

                if mode == .flashcards {
                    flashcardSection
                } else {
                    questionListSection
                }
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(topic.displayName)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button {
                    showQuiz = true
                } label: {
                    Label("בחינה", systemImage: "play.circle.fill")
                        .foregroundStyle(colorFromString(topic.color))
                }
            }
        }
        .fullScreenCover(isPresented: $showQuiz) {
            QuizFlowView(config: QuizConfig(questionCount: min(questions.count, 10), topic: topic, mode: .exam))
        }
    }

    private var topicHeader: some View {
        HStack {
            let topicProgress = progress.topicProgress[topic.rawValue]
            VStack(alignment: .leading, spacing: 4) {
                Text("\(topicProgress?.answeredCount ?? 0) שאלות נענו")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                if let p = topicProgress, p.answeredCount > 0 {
                    Text("\(Int(p.percentage))% הצלחה")
                        .font(.headline)
                        .foregroundStyle(p.percentage >= 70 ? .green : .orange)
                }
            }
            Spacer()
            ZStack {
                Circle()
                    .fill(colorFromString(topic.color).opacity(0.15))
                    .frame(width: 60, height: 60)
                Image(systemName: topic.icon)
                    .font(.title2)
                    .foregroundStyle(colorFromString(topic.color))
            }
        }
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 14))
    }

    private var modePicker: some View {
        Picker("מצב", selection: $mode) {
            Text("כרטיסיות לימוד").tag(ViewMode.flashcards)
            Text("רשימת שאלות").tag(ViewMode.list)
        }
        .pickerStyle(.segmented)
    }

    private var filterRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                FilterChip(label: "הכל", isSelected: selectedFilter == nil) {
                    selectedFilter = nil
                    currentCardIndex = 0
                }
                ForEach([Difficulty.easy, .medium, .hard], id: \.self) { diff in
                    FilterChip(
                        label: diff.displayName,
                        isSelected: selectedFilter == diff,
                        color: diffColor(diff)
                    ) {
                        selectedFilter = selectedFilter == diff ? nil : diff
                        currentCardIndex = 0
                    }
                }
            }
            .padding(.horizontal, 2)
        }
    }

    private var flashcardSection: some View {
        VStack(spacing: 16) {
            if questions.isEmpty {
                emptyState
            } else {
                Text("\(currentCardIndex + 1) / \(questions.count)")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                FlashCard(
                    question: questions[currentCardIndex],
                    showAnswer: $showAnswer
                )

                HStack(spacing: 20) {
                    Button {
                        withAnimation {
                            if currentCardIndex > 0 {
                                currentCardIndex -= 1
                                showAnswer = false
                            }
                        }
                    } label: {
                        Image(systemName: "arrow.right.circle.fill")
                            .font(.title)
                            .foregroundStyle(currentCardIndex > 0 ? .blue : .gray)
                    }
                    .disabled(currentCardIndex == 0)

                    Spacer()

                    Button {
                        withAnimation {
                            if currentCardIndex < questions.count - 1 {
                                currentCardIndex += 1
                                showAnswer = false
                            }
                        }
                    } label: {
                        Image(systemName: "arrow.left.circle.fill")
                            .font(.title)
                            .foregroundStyle(currentCardIndex < questions.count - 1 ? .blue : .gray)
                    }
                    .disabled(currentCardIndex == questions.count - 1)
                }
            }
        }
    }

    private var questionListSection: some View {
        VStack(spacing: 10) {
            if questions.isEmpty {
                emptyState
            } else {
                ForEach(Array(questions.enumerated()), id: \.element.id) { idx, question in
                    QuestionListRow(question: question, index: idx + 1)
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "tray")
                .font(.largeTitle)
                .foregroundStyle(.tertiary)
            Text("אין שאלות בסינון זה")
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 40)
    }

    private func diffColor(_ d: Difficulty) -> Color {
        switch d {
        case .easy: return .green
        case .medium: return .orange
        case .hard: return .red
        }
    }
}

struct FlashCard: View {
    let question: Question
    @Binding var showAnswer: Bool

    var body: some View {
        VStack(spacing: 0) {
            VStack(alignment: .trailing, spacing: 12) {
                HStack {
                    DifficultyBadgeSmall(difficulty: question.difficulty)
                    Spacer()
                    Text(question.topic.displayName)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Text(question.questionText)
                    .font(.body.weight(.medium))
                    .multilineTextAlignment(.trailing)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                    .padding(.vertical, 8)

                if !showAnswer {
                    Button {
                        withAnimation(.spring(response: 0.4)) {
                            showAnswer = true
                        }
                    } label: {
                        Text("הצג תשובה")
                            .font(.subheadline.bold())
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 10)
                            .background(.blue, in: RoundedRectangle(cornerRadius: 10))
                    }
                }
            }
            .padding()

            if showAnswer {
                Divider()
                VStack(alignment: .trailing, spacing: 10) {
                    Text("תשובה נכונה:")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text(question.options[question.correctIndex])
                        .font(.body.bold())
                        .foregroundStyle(.green)
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: .infinity, alignment: .trailing)

                    Text("הסבר:")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Text(question.explanation)
                        .font(.callout)
                        .foregroundStyle(.primary)
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }
                .padding()
                .background(Color.green.opacity(0.05))
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .background(.background, in: RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.08), radius: 8, y: 4)
    }
}

struct QuestionListRow: View {
    let question: Question
    let index: Int
    @State private var expanded = false

    var body: some View {
        VStack(alignment: .trailing, spacing: 0) {
            Button {
                withAnimation(.spring(response: 0.3)) {
                    expanded.toggle()
                }
            } label: {
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: expanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                        Text(question.questionText)
                            .font(.subheadline)
                            .foregroundStyle(.primary)
                            .multilineTextAlignment(.trailing)
                        DifficultyBadgeSmall(difficulty: question.difficulty)
                    }
                    Text("\(index)")
                        .font(.caption.bold())
                        .foregroundStyle(.secondary)
                        .frame(width: 24, height: 24)
                        .background(Color(.systemFill), in: Circle())
                }
                .padding()
            }

            if expanded {
                Divider()
                VStack(alignment: .trailing, spacing: 8) {
                    ForEach(Array(question.options.enumerated()), id: \.offset) { idx, option in
                        HStack {
                            if idx == question.correctIndex {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(.green)
                                    .font(.caption)
                            }
                            Spacer()
                            Text(option)
                                .font(.callout)
                                .foregroundStyle(idx == question.correctIndex ? .green : .primary)
                                .multilineTextAlignment(.trailing)
                            Text(String(Character(UnicodeScalar(0x41 + idx)!)))
                                .font(.caption.bold())
                                .foregroundStyle(.secondary)
                                .frame(width: 22, height: 22)
                                .background(Color(.systemFill), in: Circle())
                        }
                    }
                    Divider()
                    Text(question.explanation)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }
                .padding()
                .background(Color(.secondarySystemGroupedBackground))
                .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
        .background(.background, in: RoundedRectangle(cornerRadius: 12))
    }
}

struct DifficultyBadgeSmall: View {
    let difficulty: Difficulty

    var body: some View {
        Text(difficulty.displayName)
            .font(.caption2.bold())
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(color.opacity(0.15), in: Capsule())
            .foregroundStyle(color)
    }

    private var color: Color {
        switch difficulty {
        case .easy: return .green
        case .medium: return .orange
        case .hard: return .red
        }
    }
}

struct FilterChip: View {
    let label: String
    let isSelected: Bool
    var color: Color = .blue
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.subheadline.weight(isSelected ? .semibold : .regular))
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(isSelected ? color : Color(.systemFill), in: Capsule())
                .foregroundStyle(isSelected ? .white : .primary)
        }
    }
}

#Preview {
    NavigationStack {
        TopicDetailView(topic: .networking)
    }
    .environment(UserProgress())
}
