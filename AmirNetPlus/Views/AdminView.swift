import SwiftUI

// MARK: - Admin Root

struct AdminView: View {
    @Environment(UserProgress.self) private var progress
    @State private var showAddQuestion = false
    @State private var editingQuestion: CustomQuestion? = nil
    @State private var searchText = ""
    @State private var filterTopic: TopicID? = nil
    @State private var showDeleteConfirm = false
    @State private var pendingDeleteID: UUID? = nil

    private var filteredCustom: [CustomQuestion] {
        var list = progress.customQuestions
        if let t = filterTopic { list = list.filter { $0.topic == t } }
        if !searchText.isEmpty {
            list = list.filter { $0.questionText.localizedCaseInsensitiveContains(searchText) }
        }
        return list
    }

    var body: some View {
        NavigationStack {
            List {
                builtInSection
                if !filteredCustom.isEmpty || filterTopic != nil || !searchText.isEmpty {
                    customSection
                } else {
                    customEmptySection
                }
            }
            .listStyle(.insetGrouped)
            .searchable(text: $searchText, prompt: "חפש שאלה...")
            .navigationTitle("ניהול שאלות")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    filterMenu
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showAddQuestion = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(.blue)
                    }
                }
            }
            .sheet(isPresented: $showAddQuestion) {
                QuestionFormView(mode: .add)
            }
            .sheet(item: $editingQuestion) { q in
                QuestionFormView(mode: .edit(q))
            }
            .alert("מחק שאלה", isPresented: $showDeleteConfirm) {
                Button("מחק", role: .destructive) {
                    if let id = pendingDeleteID { progress.deleteCustomQuestion(id: id) }
                }
                Button("ביטול", role: .cancel) {}
            } message: {
                Text("האם אתה בטוח שברצונך למחוק את השאלה? פעולה זו אינה הפיכה.")
            }
        }
    }

    private var filterMenu: some View {
        Menu {
            Button("כל הנושאים") { filterTopic = nil }
            Divider()
            ForEach(TopicID.allCases, id: \.self) { topic in
                Button(topic.displayName) { filterTopic = topic }
            }
        } label: {
            Label(filterTopic?.displayName ?? "סנן", systemImage: "line.3.horizontal.decrease.circle")
                .foregroundStyle(filterTopic != nil ? .blue : .primary)
        }
    }

    private var builtInSection: some View {
        Section {
            NavigationLink(destination: BuiltInQuestionsView()) {
                HStack {
                    Spacer()
                    VStack(alignment: .trailing, spacing: 3) {
                        Text("שאלות מובנות")
                            .font(.subheadline.weight(.medium))
                        Text("\(QuestionsData.all.count) שאלות ב-\(TopicID.allCases.count) נושאים")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    ZStack {
                        Circle().fill(Color.blue.opacity(0.12)).frame(width: 38, height: 38)
                        Image(systemName: "books.vertical.fill").foregroundStyle(.blue)
                    }
                }
                .padding(.vertical, 4)
            }
        } header: {
            Text("בנק השאלות")
        }
    }

    private var customSection: some View {
        Section {
            ForEach(filteredCustom) { q in
                CustomQuestionRow(question: q)
                    .swipeActions(edge: .leading, allowsFullSwipe: true) {
                        Button { editingQuestion = q } label: {
                            Label("עריכה", systemImage: "pencil")
                        }.tint(.blue)
                    }
                    .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                        Button(role: .destructive) {
                            pendingDeleteID = q.id
                            showDeleteConfirm = true
                        } label: {
                            Label("מחק", systemImage: "trash")
                        }
                    }
                    .contextMenu {
                        Button { editingQuestion = q } label: {
                            Label("ערוך שאלה", systemImage: "pencil")
                        }
                        Button(role: .destructive) {
                            pendingDeleteID = q.id
                            showDeleteConfirm = true
                        } label: {
                            Label("מחק שאלה", systemImage: "trash")
                        }
                    }
            }
        } header: {
            HStack {
                Text("\(filteredCustom.count) שאלות")
                Spacer()
                Text("שאלות שלי")
            }
        }
    }

    private var customEmptySection: some View {
        Section("שאלות שלי") {
            VStack(spacing: 12) {
                Image(systemName: "plus.square.dashed")
                    .font(.largeTitle)
                    .foregroundStyle(.tertiary)
                Text("אין עדיין שאלות מותאמות אישית")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Button("הוסף שאלה ראשונה") {
                    showAddQuestion = true
                }
                .font(.subheadline.bold())
                .foregroundStyle(.blue)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
        }
    }
}

struct CustomQuestionRow: View {
    @Environment(UserProgress.self) private var progress
    let question: CustomQuestion

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Spacer()
            VStack(alignment: .trailing, spacing: 5) {
                Text(question.questionText)
                    .font(.subheadline)
                    .lineLimit(2)
                    .multilineTextAlignment(.trailing)
                HStack(spacing: 6) {
                    Text(question.createdAt.formatted(date: .abbreviated, time: .omitted))
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                    DifficultyBadgeSmall(difficulty: question.difficulty)
                    Text(question.topic.displayName)
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(colorFromString(question.topic.color).opacity(0.12), in: Capsule())
                        .foregroundStyle(colorFromString(question.topic.color))
                }
            }
            Button {
                progress.toggleBookmark(questionID: question.id)
            } label: {
                Image(systemName: progress.isBookmarked(question.id) ? "bookmark.fill" : "bookmark")
                    .foregroundStyle(progress.isBookmarked(question.id) ? .orange : .secondary)
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 2)
    }
}

// MARK: - Built-in Questions Browser

struct BuiltInQuestionsView: View {
    @Environment(UserProgress.self) private var progress
    @State private var filterTopic: TopicID? = nil
    @State private var searchText = ""
    @State private var selectedQuestion: Question? = nil

    private var questions: [Question] {
        var list = QuestionsData.all
        if let t = filterTopic { list = list.filter { $0.topic == t } }
        if !searchText.isEmpty {
            list = list.filter { $0.questionText.localizedCaseInsensitiveContains(searchText) }
        }
        return list
    }

    var body: some View {
        List(questions) { q in
            Button {
                selectedQuestion = q
            } label: {
                BuiltInQuestionRow(question: q)
            }
            .foregroundStyle(.primary)
        }
        .listStyle(.insetGrouped)
        .searchable(text: $searchText, prompt: "חפש שאלה...")
        .navigationTitle("שאלות מובנות")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Menu {
                    Button("כל הנושאים") { filterTopic = nil }
                    Divider()
                    ForEach(TopicID.allCases, id: \.self) { t in
                        Button(t.displayName) { filterTopic = t }
                    }
                } label: {
                    Label(filterTopic?.displayName ?? "נושא", systemImage: "line.3.horizontal.decrease.circle")
                }
            }
        }
        .sheet(item: $selectedQuestion) { q in
            QuestionDetailSheet(question: q)
        }
    }
}

struct BuiltInQuestionRow: View {
    @Environment(UserProgress.self) private var progress
    let question: Question

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text(question.questionText)
                    .font(.subheadline)
                    .lineLimit(2)
                    .multilineTextAlignment(.trailing)
                HStack(spacing: 6) {
                    DifficultyBadgeSmall(difficulty: question.difficulty)
                    Text(question.topic.displayName)
                        .font(.caption2)
                        .padding(.horizontal, 6).padding(.vertical, 2)
                        .background(colorFromString(question.topic.color).opacity(0.12), in: Capsule())
                        .foregroundStyle(colorFromString(question.topic.color))
                }
            }
            Button {
                progress.toggleBookmark(questionID: question.id)
            } label: {
                Image(systemName: progress.isBookmarked(question.id) ? "bookmark.fill" : "bookmark")
                    .foregroundStyle(progress.isBookmarked(question.id) ? .orange : .secondary)
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 2)
    }
}

// MARK: - Question Detail Sheet

struct QuestionDetailSheet: View {
    @Environment(UserProgress.self) private var progress
    @Environment(\.dismiss) private var dismiss
    let question: Question
    @State private var noteText: String = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .trailing, spacing: 16) {
                    headerSection
                    optionsSection
                    explanationSection
                    noteSection
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("פרטי שאלה")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) { Button("סגור") { dismiss() } }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        progress.toggleBookmark(questionID: question.id)
                    } label: {
                        Image(systemName: progress.isBookmarked(question.id) ? "bookmark.fill" : "bookmark")
                    }
                }
            }
            .onAppear { noteText = progress.notes[question.id] ?? "" }
        }
    }

    private var headerSection: some View {
        VStack(alignment: .trailing, spacing: 10) {
            HStack {
                DifficultyBadgeSmall(difficulty: question.difficulty)
                Spacer()
                Text(question.topic.displayName)
                    .font(.caption)
                    .padding(.horizontal, 8).padding(.vertical, 3)
                    .background(colorFromString(question.topic.color).opacity(0.12), in: Capsule())
                    .foregroundStyle(colorFromString(question.topic.color))
            }
            Text(question.questionText)
                .font(.body.weight(.semibold))
                .multilineTextAlignment(.trailing)
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 14))
    }

    private var optionsSection: some View {
        VStack(alignment: .trailing, spacing: 8) {
            Text("אפשרויות תשובה")
                .font(.caption.bold())
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, alignment: .trailing)
            ForEach(Array(question.options.enumerated()), id: \.offset) { idx, opt in
                HStack(spacing: 8) {
                    if idx == question.correctIndex {
                        Image(systemName: "checkmark.circle.fill").foregroundStyle(.green).font(.caption)
                    }
                    Spacer()
                    Text(opt).font(.callout).multilineTextAlignment(.trailing)
                        .foregroundStyle(idx == question.correctIndex ? .green : .primary)
                    Text(String(Character(UnicodeScalar(0x41 + idx)!)))
                        .font(.caption.bold()).frame(width: 24, height: 24)
                        .background(Color(.systemFill), in: Circle()).foregroundStyle(.secondary)
                }
                .padding(10)
                .background(idx == question.correctIndex ? Color.green.opacity(0.08) : Color(.background),
                            in: RoundedRectangle(cornerRadius: 10))
            }
        }
    }

    private var explanationSection: some View {
        VStack(alignment: .trailing, spacing: 6) {
            Label("הסבר", systemImage: "lightbulb.fill")
                .font(.caption.bold()).foregroundStyle(.orange)
                .frame(maxWidth: .infinity, alignment: .trailing)
            Text(question.explanation)
                .font(.callout).multilineTextAlignment(.trailing)
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding()
        .background(.orange.opacity(0.07), in: RoundedRectangle(cornerRadius: 14))
    }

    private var noteSection: some View {
        VStack(alignment: .trailing, spacing: 8) {
            Label("הערות אישיות", systemImage: "note.text")
                .font(.caption.bold()).foregroundStyle(.purple)
                .frame(maxWidth: .infinity, alignment: .trailing)
            TextEditor(text: $noteText)
                .frame(minHeight: 80)
                .padding(8)
                .background(Color(.systemFill), in: RoundedRectangle(cornerRadius: 10))
                .multilineTextAlignment(.trailing)
                .onChange(of: noteText) { _, newVal in
                    progress.setNote(newVal, for: question.id)
                }
        }
        .padding()
        .background(.purple.opacity(0.06), in: RoundedRectangle(cornerRadius: 14))
    }
}

// MARK: - Question Form

enum QuestionFormMode {
    case add
    case edit(CustomQuestion)
}

struct QuestionFormView: View {
    @Environment(UserProgress.self) private var progress
    @Environment(\.dismiss) private var dismiss
    let mode: QuestionFormMode

    @State private var questionText = ""
    @State private var options: [String] = ["", "", "", ""]
    @State private var correctIndex = 0
    @State private var explanation = ""
    @State private var topic: TopicID = .networking
    @State private var difficulty: Difficulty = .medium
    @State private var showValidationAlert = false

    private var isEditing: Bool {
        if case .edit = mode { return true }
        return false
    }

    var body: some View {
        NavigationStack {
            Form {
                questionSection
                optionsSection
                metadataSection
                explanationSection
            }
            .navigationTitle(isEditing ? "עריכת שאלה" : "שאלה חדשה")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("ביטול") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(isEditing ? "שמור" : "הוסף") { save() }
                        .fontWeight(.semibold)
                }
            }
            .alert("שגיאה", isPresented: $showValidationAlert) {
                Button("אישור", role: .cancel) {}
            } message: {
                Text("יש למלא את שאלה, כל 4 אפשרויות והסבר.")
            }
            .onAppear { prefill() }
        }
    }

    private var questionSection: some View {
        Section("טקסט השאלה") {
            TextEditor(text: $questionText)
                .frame(minHeight: 80)
                .multilineTextAlignment(.trailing)
        }
    }

    private var optionsSection: some View {
        Section {
            ForEach(0..<4, id: \.self) { idx in
                HStack(spacing: 10) {
                    Button {
                        correctIndex = idx
                    } label: {
                        Image(systemName: correctIndex == idx ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(correctIndex == idx ? .green : .secondary)
                    }
                    .buttonStyle(.plain)
                    TextField("אפשרות \(idx + 1)", text: $options[idx])
                        .multilineTextAlignment(.trailing)
                }
            }
        } header: {
            Text("אפשרויות תשובה (סמן את הנכונה)")
        } footer: {
            Text("לחץ על העיגול לצד האפשרות הנכונה")
        }
    }

    private var metadataSection: some View {
        Section("סיווג") {
            Picker("נושא", selection: $topic) {
                ForEach(TopicID.allCases, id: \.self) { t in
                    Text(t.displayName).tag(t)
                }
            }
            Picker("רמת קושי", selection: $difficulty) {
                Text("קל").tag(Difficulty.easy)
                Text("בינוני").tag(Difficulty.medium)
                Text("קשה").tag(Difficulty.hard)
            }
        }
    }

    private var explanationSection: some View {
        Section("הסבר לתשובה") {
            TextEditor(text: $explanation)
                .frame(minHeight: 80)
                .multilineTextAlignment(.trailing)
        }
    }

    private func prefill() {
        if case .edit(let q) = mode {
            questionText = q.questionText
            options = q.options
            correctIndex = q.correctIndex
            explanation = q.explanation
            topic = q.topic
            difficulty = q.difficulty
        }
    }

    private func save() {
        guard !questionText.trimmingCharacters(in: .whitespaces).isEmpty,
              options.allSatisfy({ !$0.trimmingCharacters(in: .whitespaces).isEmpty }),
              !explanation.trimmingCharacters(in: .whitespaces).isEmpty else {
            showValidationAlert = true
            return
        }

        switch mode {
        case .add:
            let q = CustomQuestion(
                questionText: questionText.trimmingCharacters(in: .whitespaces),
                options: options.map { $0.trimmingCharacters(in: .whitespaces) },
                correctIndex: correctIndex,
                explanation: explanation.trimmingCharacters(in: .whitespaces),
                topic: topic,
                difficulty: difficulty
            )
            progress.addCustomQuestion(q)
        case .edit(let original):
            var updated = original
            updated.questionText = questionText.trimmingCharacters(in: .whitespaces)
            updated.options = options.map { $0.trimmingCharacters(in: .whitespaces) }
            updated.correctIndex = correctIndex
            updated.explanation = explanation.trimmingCharacters(in: .whitespaces)
            updated.topic = topic
            updated.difficulty = difficulty
            progress.updateCustomQuestion(updated)
        }
        dismiss()
    }
}

