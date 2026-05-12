import SwiftUI

// MARK: - Sort Order

enum AdminSortOrder: String, CaseIterable {
    case newest, oldest, byTopic, byDifficulty

    var displayName: String {
        switch self {
        case .newest: return "חדש לישן"
        case .oldest: return "ישן לחדש"
        case .byTopic: return "לפי נושא"
        case .byDifficulty: return "לפי קושי"
        }
    }

    var icon: String {
        switch self {
        case .newest: return "arrow.down.circle"
        case .oldest: return "arrow.up.circle"
        case .byTopic: return "tag.circle"
        case .byDifficulty: return "chart.bar.xaxis"
        }
    }
}

// MARK: - Admin Root

struct AdminView: View {
    @Environment(UserProgress.self) private var progress
    @State private var showAddQuestion = false
    @State private var editingQuestion: CustomQuestion? = nil
    @State private var searchText = ""
    @State private var filterTopic: TopicID? = nil
    @State private var sortOrder: AdminSortOrder = .newest
    @State private var showDeleteConfirm = false
    @State private var pendingDeleteID: UUID? = nil

    private var filteredCustom: [CustomQuestion] {
        var list = progress.customQuestions
        if let t = filterTopic { list = list.filter { $0.topic == t } }
        if !searchText.isEmpty {
            list = list.filter { $0.questionText.localizedCaseInsensitiveContains(searchText) }
        }
        switch sortOrder {
        case .newest:
            break
        case .oldest:
            list = list.reversed()
        case .byTopic:
            list = list.sorted { $0.topic.displayName < $1.topic.displayName }
        case .byDifficulty:
            let order: [Difficulty] = [.easy, .medium, .hard]
            list = list.sorted { (order.firstIndex(of: $0.difficulty) ?? 0) < (order.firstIndex(of: $1.difficulty) ?? 0) }
        }
        return list
    }

    private var isFiltered: Bool { filterTopic != nil || !searchText.isEmpty }

    var body: some View {
        NavigationStack {
            List {
                builtInSection
                if !filteredCustom.isEmpty || isFiltered {
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
                    HStack(spacing: 6) {
                        filterMenu
                        if !progress.customQuestions.isEmpty {
                            sortMenu
                        }
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showAddQuestion = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(.blue)
                            .font(.title3)
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
            Button {
                filterTopic = nil
            } label: {
                Label("כל הנושאים", systemImage: filterTopic == nil ? "checkmark" : "line.3.horizontal.decrease")
            }
            Divider()
            ForEach(TopicID.allCases, id: \.self) { topic in
                Button {
                    filterTopic = topic
                } label: {
                    Label(topic.displayName, systemImage: filterTopic == topic ? "checkmark" : topic.icon)
                }
            }
        } label: {
            Label(filterTopic?.displayName ?? "סנן", systemImage: "line.3.horizontal.decrease.circle")
                .foregroundStyle(filterTopic != nil ? .blue : .primary)
        }
    }

    private var sortMenu: some View {
        Menu {
            ForEach(AdminSortOrder.allCases, id: \.self) { order in
                Button {
                    sortOrder = order
                } label: {
                    Label(order.displayName, systemImage: sortOrder == order ? "checkmark" : order.icon)
                }
            }
        } label: {
            Image(systemName: "arrow.up.arrow.down.circle")
                .foregroundStyle(sortOrder != .newest ? .blue : .secondary)
        }
    }

    private var builtInSection: some View {
        Section {
            NavigationLink(destination: BuiltInQuestionsView()) {
                HStack(spacing: 14) {
                    Spacer()
                    VStack(alignment: .trailing, spacing: 6) {
                        Text("שאלות מובנות")
                            .font(.subheadline.weight(.semibold))
                        Text("\(QuestionsData.all.count) שאלות · \(TopicID.allCases.count) נושאים")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        HStack(spacing: 5) {
                            ForEach(TopicID.allCases, id: \.self) { topic in
                                Circle()
                                    .fill(colorFromString(topic.color))
                                    .frame(width: 8, height: 8)
                            }
                        }
                    }
                    ZStack {
                        RoundedRectangle(cornerRadius: 10)
                            .fill(Color.blue.opacity(0.12))
                            .frame(width: 46, height: 46)
                        Image(systemName: "books.vertical.fill")
                            .foregroundStyle(.blue)
                            .font(.title3)
                    }
                }
                .padding(.vertical, 6)
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
                        Divider()
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
                if isFiltered {
                    Text("\(filteredCustom.count) מתוך \(progress.customQuestions.count)")
                } else {
                    Text("\(filteredCustom.count) שאלות")
                }
                Spacer()
                Text("שאלות שלי")
            }
        }
    }

    private var customEmptySection: some View {
        Section("שאלות שלי") {
            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(Color.blue.opacity(0.08))
                        .frame(width: 72, height: 72)
                    Image(systemName: "plus.square.dashed")
                        .font(.largeTitle)
                        .foregroundStyle(.blue.opacity(0.55))
                }
                VStack(spacing: 4) {
                    Text("אין עדיין שאלות מותאמות אישית")
                        .font(.subheadline.weight(.medium))
                    Text("צור שאלות משלך לתרגול ממוקד")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Button {
                    showAddQuestion = true
                } label: {
                    Label("הוסף שאלה ראשונה", systemImage: "plus")
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                        .padding(.horizontal, 22)
                        .padding(.vertical, 10)
                        .background(Color.blue, in: Capsule())
                }
                .buttonStyle(.plain)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 28)
        }
    }
}

// MARK: - Custom Question Row

struct CustomQuestionRow: View {
    @Environment(UserProgress.self) private var progress
    let question: CustomQuestion

    private var difficultyColor: Color {
        switch question.difficulty {
        case .easy: return .green
        case .medium: return .orange
        case .hard: return .red
        }
    }

    var body: some View {
        HStack(alignment: .center, spacing: 0) {
            RoundedRectangle(cornerRadius: 2)
                .fill(difficultyColor)
                .frame(width: 3, height: 44)
                .padding(.trailing, 10)

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
                    .padding(.leading, 10)
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
        Group {
            if questions.isEmpty {
                emptyState
            } else {
                List(questions) { q in
                    Button {
                        selectedQuestion = q
                    } label: {
                        BuiltInQuestionRow(question: q)
                    }
                    .foregroundStyle(.primary)
                }
                .listStyle(.insetGrouped)
            }
        }
        .searchable(text: $searchText, prompt: "חפש שאלה...")
        .navigationTitle(filterTopic?.displayName ?? "שאלות מובנות")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Menu {
                    Button {
                        filterTopic = nil
                    } label: {
                        Label("כל הנושאים", systemImage: filterTopic == nil ? "checkmark" : "line.3.horizontal.decrease")
                    }
                    Divider()
                    ForEach(TopicID.allCases, id: \.self) { t in
                        Button {
                            filterTopic = t
                        } label: {
                            Label(t.displayName, systemImage: filterTopic == t ? "checkmark" : t.icon)
                        }
                    }
                } label: {
                    Label(filterTopic?.displayName ?? "נושא", systemImage: "line.3.horizontal.decrease.circle")
                        .foregroundStyle(filterTopic != nil ? .blue : .primary)
                }
            }
            ToolbarItem(placement: .principal) {
                Text("\(questions.count) שאלות")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .sheet(item: $selectedQuestion) { q in
            QuestionDetailSheet(question: q)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 48))
                .foregroundStyle(.tertiary)
            VStack(spacing: 6) {
                Text("לא נמצאו שאלות")
                    .font(.headline)
                Text("נסה לשנות את החיפוש או הסינון")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Button {
                filterTopic = nil
            } label: {
                Text("נקה סינון")
                    .font(.subheadline)
                    .foregroundStyle(.blue)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground))
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
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("סגור") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        progress.toggleBookmark(questionID: question.id)
                    } label: {
                        Image(systemName: progress.isBookmarked(question.id) ? "bookmark.fill" : "bookmark")
                            .foregroundStyle(progress.isBookmarked(question.id) ? .orange : .blue)
                    }
                }
            }
            .onAppear { noteText = progress.notes[question.id] ?? "" }
        }
    }

    private var headerSection: some View {
        VStack(alignment: .trailing, spacing: 12) {
            HStack {
                DifficultyBadgeSmall(difficulty: question.difficulty)
                Spacer()
                HStack(spacing: 6) {
                    Text(question.topic.displayName)
                        .font(.caption)
                        .padding(.horizontal, 8).padding(.vertical, 3)
                        .background(colorFromString(question.topic.color).opacity(0.12), in: Capsule())
                        .foregroundStyle(colorFromString(question.topic.color))
                    Image(systemName: question.topic.icon)
                        .font(.caption)
                        .foregroundStyle(colorFromString(question.topic.color))
                }
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
                let isCorrect = idx == question.correctIndex
                HStack(spacing: 10) {
                    if isCorrect {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                            .font(.subheadline)
                    }
                    Spacer()
                    Text(opt)
                        .font(.callout)
                        .multilineTextAlignment(.trailing)
                        .foregroundStyle(isCorrect ? .green : .primary)
                    ZStack {
                        Circle()
                            .fill(isCorrect ? Color.green.opacity(0.15) : Color(.systemFill))
                            .frame(width: 28, height: 28)
                        Text(String(Character(UnicodeScalar(0x41 + idx)!)))
                            .font(.caption.bold())
                            .foregroundStyle(isCorrect ? .green : .secondary)
                    }
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 10)
                        .fill(isCorrect ? Color.green.opacity(0.08) : Color(.background))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .strokeBorder(isCorrect ? Color.green.opacity(0.3) : Color.clear, lineWidth: 1)
                        )
                )
            }
        }
    }

    private var explanationSection: some View {
        VStack(alignment: .trailing, spacing: 6) {
            Label("הסבר", systemImage: "lightbulb.fill")
                .font(.caption.bold())
                .foregroundStyle(.orange)
                .frame(maxWidth: .infinity, alignment: .trailing)
            Text(question.explanation)
                .font(.callout)
                .multilineTextAlignment(.trailing)
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding()
        .background(.orange.opacity(0.07), in: RoundedRectangle(cornerRadius: 14))
    }

    private var noteSection: some View {
        VStack(alignment: .trailing, spacing: 8) {
            Label("הערות אישיות", systemImage: "note.text")
                .font(.caption.bold())
                .foregroundStyle(.purple)
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

    private var isValid: Bool {
        !questionText.trimmingCharacters(in: .whitespaces).isEmpty &&
        options.allSatisfy({ !$0.trimmingCharacters(in: .whitespaces).isEmpty }) &&
        !explanation.trimmingCharacters(in: .whitespaces).isEmpty
    }

    private let optionLetters = ["א", "ב", "ג", "ד"]

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
                        .disabled(!isValid)
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
        Section {
            TextEditor(text: $questionText)
                .frame(minHeight: 80)
                .multilineTextAlignment(.trailing)
        } header: {
            Text("טקסט השאלה")
        } footer: {
            HStack {
                Spacer()
                Text("\(questionText.count) תווים")
                    .foregroundStyle(questionText.count > 300 ? .orange : .secondary)
            }
        }
    }

    private var optionsSection: some View {
        Section {
            ForEach(0..<4, id: \.self) { idx in
                Button {
                    correctIndex = idx
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: correctIndex == idx ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(correctIndex == idx ? .green : .secondary)
                            .font(.title3)
                        TextField("אפשרות \(idx + 1)", text: $options[idx])
                            .multilineTextAlignment(.trailing)
                            .foregroundStyle(.primary)
                        Text(optionLetters[idx])
                            .font(.caption.bold())
                            .frame(width: 24, height: 24)
                            .background(
                                correctIndex == idx ? Color.green.opacity(0.15) : Color(.systemFill),
                                in: Circle()
                            )
                            .foregroundStyle(correctIndex == idx ? .green : .secondary)
                    }
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .listRowBackground(
                    correctIndex == idx ? Color.green.opacity(0.05) : Color(.systemBackground)
                )
            }
        } header: {
            Text("אפשרויות תשובה")
        } footer: {
            HStack {
                Spacer()
                Label("האפשרות הנכונה: \(optionLetters[correctIndex])", systemImage: "checkmark.circle.fill")
                    .font(.caption)
                    .foregroundStyle(.green)
            }
        }
    }

    private var metadataSection: some View {
        Section("סיווג") {
            Picker("נושא", selection: $topic) {
                ForEach(TopicID.allCases, id: \.self) { t in
                    Label(t.displayName, systemImage: t.icon).tag(t)
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
        Section {
            TextEditor(text: $explanation)
                .frame(minHeight: 80)
                .multilineTextAlignment(.trailing)
        } header: {
            Text("הסבר לתשובה")
        } footer: {
            if !isValid && !questionText.isEmpty {
                HStack {
                    Spacer()
                    Text("יש למלא את כל השדות לפני השמירה")
                        .font(.caption)
                        .foregroundStyle(.orange)
                }
            }
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
        guard isValid else {
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
