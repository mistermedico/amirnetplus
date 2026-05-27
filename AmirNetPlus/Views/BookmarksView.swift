import SwiftUI

struct BookmarksView: View {
    @Environment(UserProgress.self) private var progress
    @State private var filterTopic: TopicID? = nil
    @State private var searchText = ""
    @State private var selectedQuestion: Question? = nil
    @State private var showQuiz = false

    private var bookmarked: [Question] {
        var list = progress.bookmarkedQuestions
        if let t = filterTopic { list = list.filter { $0.topic == t } }
        if !searchText.isEmpty {
            list = list.filter { $0.questionText.localizedCaseInsensitiveContains(searchText) }
        }
        return list
    }

    var body: some View {
        NavigationStack {
            Group {
                if progress.bookmarkedQuestionIDs.isEmpty {
                    emptyState
                } else {
                    questionList
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("שאלות שמורות")
            .navigationBarTitleDisplayMode(.large)
            .searchable(text: $searchText, prompt: "חפש בשמורות...")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    filterMenu
                }
                if !bookmarked.isEmpty {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button {
                            showQuiz = true
                        } label: {
                            Label("תרגל", systemImage: "play.circle.fill")
                        }
                    }
                }
            }
            .sheet(item: $selectedQuestion) { q in
                QuestionDetailSheet(question: q)
            }
            .fullScreenCover(isPresented: $showQuiz) {
                BookmarkedQuizView(questions: bookmarked)
            }
        }
    }

    private var filterMenu: some View {
        Menu {
            Button("כל הנושאים") { filterTopic = nil }
            Divider()
            ForEach(TopicID.allCases, id: \.self) { topic in
                let count = progress.bookmarkedQuestions.filter { $0.topic == topic }.count
                if count > 0 {
                    Button("\(topic.displayName) (\(count))") { filterTopic = topic }
                }
            }
        } label: {
            Label(filterTopic?.displayName ?? "סנן", systemImage: "line.3.horizontal.decrease.circle")
                .foregroundStyle(filterTopic != nil ? .orange : .primary)
        }
    }

    private var questionList: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Stats bar
                HStack {
                    Spacer()
                    Label("\(bookmarked.count) שאלות שמורות", systemImage: "bookmark.fill")
                        .font(.caption)
                        .foregroundStyle(.orange)
                }
                .padding(.horizontal)
                .padding(.vertical, 8)

                if bookmarked.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "magnifyingglass")
                            .font(.largeTitle).foregroundStyle(.tertiary)
                        Text("אין תוצאות לסינון זה")
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 60)
                } else {
                    LazyVStack(spacing: 10) {
                        ForEach(bookmarked) { question in
                            BookmarkCard(question: question) {
                                selectedQuestion = question
                            }
                        }
                    }
                    .padding()
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Image(systemName: "bookmark.slash")
                .font(.system(size: 60))
                .foregroundStyle(.orange.opacity(0.4))
            Text("אין שאלות שמורות")
                .font(.title3.bold())
            Text("שמור שאלות מהבנק או מהבחינות על ידי לחיצה על אייקון הסימנייה")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct BookmarkCard: View {
    @Environment(UserProgress.self) private var progress
    let question: Question
    let onTap: () -> Void
    @State private var revealed = false

    var body: some View {
        VStack(alignment: .trailing, spacing: 0) {
            Button(action: onTap) {
                HStack(alignment: .top, spacing: 10) {
                    VStack(alignment: .leading, spacing: 4) {
                        Button {
                            progress.toggleBookmark(questionID: question.id)
                        } label: {
                            Image(systemName: "bookmark.fill")
                                .foregroundStyle(.orange)
                        }
                        .buttonStyle(.plain)
                        Spacer()
                        if progress.notes[question.id] != nil {
                            Image(systemName: "note.text")
                                .font(.caption2).foregroundStyle(.purple)
                        }
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 6) {
                        Text(question.questionText)
                            .font(.subheadline)
                            .multilineTextAlignment(.trailing)
                            .foregroundStyle(.primary)
                        HStack(spacing: 6) {
                            DifficultyBadgeSmall(difficulty: question.difficulty)
                            Text(question.topic.displayName)
                                .font(.caption2)
                                .padding(.horizontal, 6).padding(.vertical, 2)
                                .background(colorFromString(question.topic.color).opacity(0.12), in: Capsule())
                                .foregroundStyle(colorFromString(question.topic.color))
                        }
                    }
                }
                .padding()
            }
            .buttonStyle(.plain)

            if let note = progress.notes[question.id], !note.isEmpty {
                Divider()
                HStack {
                    Spacer()
                    Text(note)
                        .font(.caption)
                        .foregroundStyle(.purple)
                        .multilineTextAlignment(.trailing)
                        .lineLimit(2)
                    Image(systemName: "note.text")
                        .font(.caption2).foregroundStyle(.purple)
                }
                .padding(.horizontal).padding(.bottom, 8)
            }
        }
        .background(.background, in: RoundedRectangle(cornerRadius: 14))
        .shadow(color: .black.opacity(0.06), radius: 5, y: 2)
    }
}

// MARK: - Bookmarked Quiz

struct BookmarkedQuizView: View {
    @Environment(UserProgress.self) private var progress
    @Environment(\.dismiss) private var dismiss
    let questions: [Question]
    @State private var session: QuizSession
    @State private var selectedOption: Int? = nil
    @State private var showResult = false

    init(questions: [Question]) {
        self.questions = questions
        _session = State(initialValue: QuizSession(questions: questions.shuffled()))
    }

    var body: some View {
        Group {
            if showResult {
                QuizResultsView(
                    session: session,
                    onDismiss: { dismiss() },
                    onRetry: {
                        session = QuizSession(questions: questions.shuffled())
                        showResult = false
                        selectedOption = nil
                    }
                )
            } else {
                bookmarkQuizContent
            }
        }
        .onChange(of: showResult) { _, newVal in
            if newVal { progress.recordQuizSession(session) }
        }
    }

    private var bookmarkQuizContent: some View {
        NavigationStack {
            VStack(spacing: 0) {
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Rectangle().fill(Color(.systemFill)).frame(height: 4)
                        Rectangle().fill(Color.orange)
                            .frame(width: geo.size.width * Double(session.currentIndex) / Double(session.questions.count), height: 4)
                    }
                }
                .frame(height: 4)

                if let q = session.currentQuestion {
                    ScrollView {
                        VStack(spacing: 16) {
                            VStack(alignment: .trailing, spacing: 10) {
                                HStack {
                                    DifficultyBadgeSmall(difficulty: q.difficulty)
                                    Spacer()
                                    Label("שמורות", systemImage: "bookmark.fill")
                                        .font(.caption).foregroundStyle(.orange)
                                }
                                Text(q.questionText)
                                    .font(.body.weight(.semibold))
                                    .multilineTextAlignment(.trailing)
                                    .frame(maxWidth: .infinity, alignment: .trailing)
                            }
                            .padding()
                            .background(.background, in: RoundedRectangle(cornerRadius: 14))

                            if let note = progress.notes[q.id], !note.isEmpty {
                                HStack {
                                    Spacer()
                                    Text(note)
                                        .font(.caption)
                                        .foregroundStyle(.purple)
                                        .multilineTextAlignment(.trailing)
                                    Image(systemName: "note.text")
                                        .font(.caption).foregroundStyle(.purple)
                                }
                                .padding(10)
                                .background(.purple.opacity(0.07), in: RoundedRectangle(cornerRadius: 10))
                            }

                            ForEach(Array(q.options.enumerated()), id: \.offset) { idx, opt in
                                OptionButton(
                                    text: opt, index: idx,
                                    selectedOption: selectedOption,
                                    correctIndex: selectedOption != nil ? q.correctIndex : nil,
                                    action: {
                                        guard selectedOption == nil else { return }
                                        withAnimation { selectedOption = idx; session.answer(idx) }
                                    }
                                )
                            }
                        }
                        .padding()
                    }
                }

                HStack {
                    if selectedOption != nil {
                        Button {
                            withAnimation {
                                if session.currentIndex == session.questions.count - 1 {
                                    session.finish()
                                    showResult = true
                                } else {
                                    session.next()
                                    selectedOption = nil
                                }
                            }
                        } label: {
                            HStack {
                                Text(session.currentIndex == session.questions.count - 1 ? "סיים" : "הבא")
                                    .font(.headline)
                                Image(systemName: "arrow.left")
                            }
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(.orange, in: RoundedRectangle(cornerRadius: 12))
                        }
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                    }
                }
                .padding()
                .background(.background)
                .animation(.spring(response: 0.3), value: selectedOption)
            }
            .background(Color(.systemGroupedBackground))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("יציאה") { dismiss() }.foregroundStyle(.red)
                }
                ToolbarItem(placement: .principal) {
                    Text("\(session.currentIndex + 1) / \(session.questions.count)")
                        .font(.headline)
                }
            }
        }
    }
}
