import SwiftUI

struct QuizResultsView: View {
    let session: QuizSession
    let onDismiss: () -> Void
    let onRetry: () -> Void
    @State private var showDetails = false

    private var grade: String {
        switch session.percentage {
        case 90...100: return "מצוין!"
        case 75..<90: return "טוב מאוד"
        case 60..<75: return "טוב"
        case 50..<60: return "עובר"
        default: return "נסה שוב"
        }
    }

    private var gradeColor: Color {
        switch session.percentage {
        case 80...100: return .green
        case 60..<80: return .orange
        default: return .red
        }
    }

    private var gradeIcon: String {
        switch session.percentage {
        case 80...100: return "star.fill"
        case 60..<80: return "hand.thumbsup.fill"
        default: return "arrow.clockwise"
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    scoreCircle
                    statsRow
                    Divider()
                    Toggle("הצג פירוט תשובות", isOn: $showDetails)
                        .padding(.horizontal)
                    if showDetails {
                        answersDetail
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("תוצאות הבחינה")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("סגור") { onDismiss() }
                }
            }
            .safeAreaInset(edge: .bottom) {
                actionButtons
                    .padding()
                    .background(.background)
            }
        }
    }

    private var scoreCircle: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .stroke(Color(.systemFill), lineWidth: 16)
                    .frame(width: 160, height: 160)
                Circle()
                    .trim(from: 0, to: session.percentage / 100)
                    .stroke(gradeColor, style: StrokeStyle(lineWidth: 16, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .frame(width: 160, height: 160)
                    .animation(.easeOut(duration: 1.2), value: session.percentage)
                VStack(spacing: 4) {
                    Image(systemName: gradeIcon)
                        .font(.title3)
                        .foregroundStyle(gradeColor)
                    Text("\(Int(session.percentage))%")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundStyle(gradeColor)
                    Text(grade)
                        .font(.subheadline.bold())
                        .foregroundStyle(.secondary)
                }
            }
            Text("\(session.score) מתוך \(session.questions.count) תשובות נכונות")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(.top)
    }

    private var statsRow: some View {
        HStack(spacing: 0) {
            statItem(value: "\(session.score)", label: "נכון", color: .green)
            Divider().frame(height: 50)
            statItem(value: "\(session.questions.count - session.score)", label: "שגוי", color: .red)
            Divider().frame(height: 50)
            statItem(value: formatDuration(session.duration), label: "זמן", color: .blue)
        }
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 14))
    }

    private func statItem(value: String, label: String, color: Color) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2.bold())
                .foregroundStyle(color)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }

    private var answersDetail: some View {
        VStack(spacing: 10) {
            ForEach(Array(session.questions.enumerated()), id: \.element.id) { idx, question in
                let selected = session.selectedAnswers[idx]
                let isCorrect = selected == question.correctIndex
                AnswerReviewRow(
                    question: question,
                    index: idx + 1,
                    selectedIndex: selected,
                    isCorrect: isCorrect
                )
            }
        }
    }

    private var actionButtons: some View {
        HStack(spacing: 12) {
            Button {
                onRetry()
            } label: {
                Label("נסה שוב", systemImage: "arrow.clockwise")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color(.systemFill), in: RoundedRectangle(cornerRadius: 12))
            }
            .foregroundStyle(.primary)

            Button {
                onDismiss()
            } label: {
                Label("סיום", systemImage: "checkmark")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(.blue, in: RoundedRectangle(cornerRadius: 12))
            }
            .foregroundStyle(.white)
        }
    }

    private func formatDuration(_ interval: TimeInterval) -> String {
        let minutes = Int(interval) / 60
        let seconds = Int(interval) % 60
        return "\(minutes):\(String(format: "%02d", seconds))"
    }
}

struct AnswerReviewRow: View {
    let question: Question
    let index: Int
    let selectedIndex: Int?
    let isCorrect: Bool
    @State private var expanded = false

    var body: some View {
        VStack(alignment: .trailing, spacing: 0) {
            Button {
                withAnimation(.spring(response: 0.3)) { expanded.toggle() }
            } label: {
                HStack(spacing: 10) {
                    Image(systemName: expanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text(question.questionText)
                        .font(.callout)
                        .foregroundStyle(.primary)
                        .multilineTextAlignment(.trailing)
                        .lineLimit(expanded ? nil : 2)
                    Image(systemName: isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                        .foregroundStyle(isCorrect ? .green : .red)
                    Text("\(index)")
                        .font(.caption.bold())
                        .frame(width: 22, height: 22)
                        .background(Color(.systemFill), in: Circle())
                        .foregroundStyle(.secondary)
                }
                .padding()
            }

            if expanded {
                Divider()
                VStack(alignment: .trailing, spacing: 6) {
                    if let sel = selectedIndex, sel != question.correctIndex {
                        HStack {
                            Spacer()
                            Text("תשובתך: \(question.options[sel])")
                                .font(.caption)
                                .foregroundStyle(.red)
                        }
                    }
                    HStack {
                        Spacer()
                        Text("תשובה נכונה: \(question.options[question.correctIndex])")
                            .font(.caption.bold())
                            .foregroundStyle(.green)
                    }
                    Text(question.explanation)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }
                .padding()
                .background(Color(.secondarySystemGroupedBackground))
            }
        }
        .background(.background, in: RoundedRectangle(cornerRadius: 12))
    }
}

#Preview {
    QuizResultsView(
        session: {
            var s = QuizSession(questions: QuestionsData.randomQuestions(count: 5))
            s.selectedAnswers = [0: 1, 1: 0, 2: 2, 3: 1, 4: 0]
            return s
        }(),
        onDismiss: {},
        onRetry: {}
    )
    .environment(UserProgress())
}
