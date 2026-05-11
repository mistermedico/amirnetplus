import SwiftUI

struct QuizFlowView: View {
    let config: QuizConfig
    @Environment(UserProgress.self) private var progress
    @Environment(\.dismiss) private var dismiss
    @State private var session: QuizSession
    @State private var showResult = false
    @State private var showExplanation = false
    @State private var selectedOption: Int? = nil
    @State private var animateChoice = false

    init(config: QuizConfig) {
        self.config = config
        let questions = QuestionsData.randomQuestions(count: config.questionCount, topic: config.topic)
        _session = State(initialValue: QuizSession(questions: questions))
    }

    var body: some View {
        Group {
            if showResult {
                QuizResultsView(session: session, onDismiss: { dismiss() }, onRetry: restartQuiz)
            } else {
                quizContent
            }
        }
        .onChange(of: showResult) { _, newValue in
            if newValue { progress.recordQuizSession(session) }
        }
    }

    private var quizContent: some View {
        NavigationStack {
            VStack(spacing: 0) {
                progressBar
                ScrollView {
                    VStack(spacing: 20) {
                        questionCard
                        optionsSection
                        if config.mode == .study && showExplanation {
                            explanationCard
                        }
                    }
                    .padding()
                }
                bottomBar
            }
            .background(Color(.systemGroupedBackground))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("יציאה") { dismiss() }
                        .foregroundStyle(.red)
                }
                ToolbarItem(placement: .principal) {
                    Text("\(session.currentIndex + 1) / \(session.questions.count)")
                        .font(.headline)
                }
            }
        }
    }

    private var progressBar: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Rectangle().fill(Color(.systemFill)).frame(height: 4)
                Rectangle()
                    .fill(Color.blue)
                    .frame(width: geo.size.width * Double(session.currentIndex) / Double(session.questions.count), height: 4)
                    .animation(.easeInOut, value: session.currentIndex)
            }
        }
        .frame(height: 4)
    }

    private var questionCard: some View {
        VStack(alignment: .trailing, spacing: 12) {
            HStack {
                DifficultyBadgeSmall(difficulty: session.currentQuestion!.difficulty)
                Spacer()
                Text(session.currentQuestion!.topic.displayName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Text(session.currentQuestion!.questionText)
                .font(.body.weight(.semibold))
                .multilineTextAlignment(.trailing)
                .frame(maxWidth: .infinity, alignment: .trailing)
                .padding(.vertical, 4)
        }
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 6, y: 2)
    }

    private var optionsSection: some View {
        VStack(spacing: 10) {
            ForEach(Array(session.currentQuestion!.options.enumerated()), id: \.offset) { idx, option in
                OptionButton(
                    text: option,
                    index: idx,
                    selectedOption: selectedOption,
                    correctIndex: config.mode == .study ? session.currentQuestion!.correctIndex : nil,
                    action: { selectOption(idx) }
                )
            }
        }
    }

    private var explanationCard: some View {
        VStack(alignment: .trailing, spacing: 8) {
            HStack {
                Spacer()
                Label("הסבר", systemImage: "lightbulb.fill")
                    .font(.subheadline.bold())
                    .foregroundStyle(.orange)
            }
            Text(session.currentQuestion!.explanation)
                .font(.callout)
                .multilineTextAlignment(.trailing)
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding()
        .background(.orange.opacity(0.08), in: RoundedRectangle(cornerRadius: 14))
        .transition(.move(edge: .bottom).combined(with: .opacity))
    }

    private var bottomBar: some View {
        HStack {
            if selectedOption != nil {
                Button {
                    advanceQuestion()
                } label: {
                    HStack {
                        Text(session.currentIndex == session.questions.count - 1 ? "סיים" : "הבא")
                            .font(.headline)
                        Image(systemName: "arrow.left")
                    }
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(.blue, in: RoundedRectangle(cornerRadius: 12))
                }
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .padding()
        .background(.background)
        .animation(.spring(response: 0.3), value: selectedOption)
    }

    private func selectOption(_ idx: Int) {
        guard selectedOption == nil else { return }
        withAnimation(.spring(response: 0.3)) {
            selectedOption = idx
            session.answer(idx)
            if config.mode == .study { showExplanation = true }
        }
    }

    private func advanceQuestion() {
        withAnimation(.easeInOut(duration: 0.2)) {
            if session.currentIndex == session.questions.count - 1 {
                showResult = true
            } else {
                session.next()
                selectedOption = nil
                showExplanation = false
            }
        }
    }

    private func restartQuiz() {
        let questions = QuestionsData.randomQuestions(count: config.questionCount, topic: config.topic)
        session = QuizSession(questions: questions)
        showResult = false
        selectedOption = nil
        showExplanation = false
    }
}

struct OptionButton: View {
    let text: String
    let index: Int
    let selectedOption: Int?
    let correctIndex: Int?
    let action: () -> Void

    private var isSelected: Bool { selectedOption == index }
    private var isCorrect: Bool { correctIndex == index }
    private var isWrong: Bool { isSelected && correctIndex != nil && !isCorrect }

    private var backgroundColor: Color {
        if selectedOption == nil { return .background }
        if isCorrect && correctIndex != nil { return .green.opacity(0.15) }
        if isWrong { return .red.opacity(0.15) }
        return .background
    }

    private var borderColor: Color {
        if selectedOption == nil { return .clear }
        if isCorrect && correctIndex != nil { return .green }
        if isWrong { return .red }
        return .clear
    }

    private var icon: String? {
        if selectedOption == nil { return nil }
        if isCorrect && correctIndex != nil { return "checkmark.circle.fill" }
        if isWrong { return "xmark.circle.fill" }
        return nil
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                if let iconName = icon {
                    Image(systemName: iconName)
                        .foregroundStyle(isCorrect ? .green : .red)
                }
                Spacer()
                Text(text)
                    .font(.body)
                    .multilineTextAlignment(.trailing)
                    .foregroundStyle(.primary)
                Text(String(Character(UnicodeScalar(0x41 + index)!)))
                    .font(.callout.bold())
                    .foregroundStyle(.secondary)
                    .frame(width: 28, height: 28)
                    .background(Color(.systemFill), in: Circle())
            }
            .padding()
            .background(backgroundColor, in: RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(borderColor, lineWidth: isSelected ? 2 : 0)
            )
        }
        .disabled(selectedOption != nil)
        .animation(.easeInOut(duration: 0.2), value: selectedOption)
    }
}

#Preview {
    QuizFlowView(config: QuizConfig(questionCount: 5, topic: nil, mode: .exam))
        .environment(UserProgress())
}
