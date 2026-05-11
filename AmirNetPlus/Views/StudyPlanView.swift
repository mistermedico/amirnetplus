import SwiftUI

struct StudyPlanView: View {
    @Environment(UserProgress.self) private var progress
    @State private var showAddPlan = false
    @State private var editingPlan: StudyPlan? = nil
    @State private var deletePlanID: UUID? = nil
    @State private var showDeleteConfirm = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    if let active = progress.activeStudyPlan {
                        activePlanBanner(active)
                    }
                    dailyGoalCard
                    if progress.studyPlans.isEmpty {
                        emptyState
                    } else {
                        plansSection
                    }
                    weakTopicsSection
                    quizHistorySection
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("תכנון לימודים")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showAddPlan = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                    }
                }
            }
            .sheet(isPresented: $showAddPlan) {
                StudyPlanFormView(mode: .add)
            }
            .sheet(item: $editingPlan) { plan in
                StudyPlanFormView(mode: .edit(plan))
            }
            .alert("מחק תוכנית", isPresented: $showDeleteConfirm) {
                Button("מחק", role: .destructive) {
                    if let id = deletePlanID { progress.deleteStudyPlan(id: id) }
                }
                Button("ביטול", role: .cancel) {}
            } message: {
                Text("האם למחוק את תוכנית הלימודים?")
            }
        }
    }

    // MARK: - Active Plan Banner

    private func activePlanBanner(_ plan: StudyPlan) -> some View {
        VStack(alignment: .trailing, spacing: 10) {
            HStack {
                HStack(spacing: 6) {
                    Text("\(plan.daysRemaining) ימים נותרו")
                        .font(.caption.bold())
                        .padding(.horizontal, 8).padding(.vertical, 3)
                        .background(.green.opacity(0.15), in: Capsule())
                        .foregroundStyle(.green)
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(.green).font(.caption)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text("תוכנית פעילה")
                        .font(.caption).foregroundStyle(.secondary)
                    Text(plan.title)
                        .font(.headline)
                }
                Image(systemName: "calendar.badge.clock")
                    .font(.title2).foregroundStyle(.green)
            }

            HStack {
                Spacer()
                Text("יעד: \(plan.targetDate.formatted(date: .abbreviated, time: .omitted))")
                    .font(.caption).foregroundStyle(.secondary)
            }

            let topicNames = plan.topicIDs.compactMap { TopicID(rawValue: $0)?.displayName }
            if !topicNames.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(topicNames, id: \.self) { name in
                            Text(name)
                                .font(.caption2)
                                .padding(.horizontal, 8).padding(.vertical, 3)
                                .background(Color.blue.opacity(0.1), in: Capsule())
                                .foregroundStyle(.blue)
                        }
                    }
                }
            }

            // Daily goal progress
            let today = progress.todayAnswered
            let goal = plan.dailyGoal
            VStack(alignment: .trailing, spacing: 4) {
                HStack {
                    Text("\(today)/\(goal) שאלות היום")
                        .font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    Text("יעד יומי")
                        .font(.caption.bold())
                }
                ProgressView(value: Double(min(today, goal)), total: Double(goal))
                    .tint(today >= goal ? .green : .blue)
            }
        }
        .padding()
        .background(
            LinearGradient(colors: [.green.opacity(0.07), .blue.opacity(0.07)],
                           startPoint: .topTrailing, endPoint: .bottomLeading),
            in: RoundedRectangle(cornerRadius: 16)
        )
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(.green.opacity(0.2), lineWidth: 1))
    }

    // MARK: - Daily Goal Card

    private var dailyGoalCard: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text("\(progress.todayAnswered) / \(progress.dailyGoal)")
                    .font(.title2.bold())
                    .foregroundStyle(progress.todayAnswered >= progress.dailyGoal ? .green : .blue)
                Text("שאלות היום")
                    .font(.caption).foregroundStyle(.secondary)
            }
            ProgressView(
                value: Double(min(progress.todayAnswered, progress.dailyGoal)),
                total: Double(progress.dailyGoal)
            )
            .tint(progress.todayAnswered >= progress.dailyGoal ? .green : .blue)
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text("יעד יומי")
                    .font(.caption).foregroundStyle(.secondary)
                Image(systemName: progress.todayAnswered >= progress.dailyGoal
                      ? "checkmark.circle.fill" : "target")
                    .foregroundStyle(progress.todayAnswered >= progress.dailyGoal ? .green : .orange)
                    .font(.title3)
            }
        }
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 14))
        .shadow(color: .black.opacity(0.05), radius: 5, y: 2)
    }

    // MARK: - Plans Section

    private var plansSection: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SectionHeader(title: "תוכניות לימודים")
            ForEach(progress.studyPlans) { plan in
                StudyPlanCard(plan: plan,
                    onActivate: { progress.activateStudyPlan(id: plan.id) },
                    onEdit: { editingPlan = plan },
                    onDelete: { deletePlanID = plan.id; showDeleteConfirm = true }
                )
            }
        }
    }

    // MARK: - Weak Topics

    private var weakTopicsSection: some View {
        Group {
            if !progress.weakTopics.isEmpty {
                VStack(alignment: .trailing, spacing: 12) {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundStyle(.orange).font(.caption)
                        Spacer()
                        Text("נושאים לחיזוק")
                            .font(.headline)
                    }
                    ForEach(progress.weakTopics.prefix(3), id: \.self) { topicRaw in
                        if let topic = TopicID(rawValue: topicRaw),
                           let tp = progress.topicProgress[topicRaw] {
                            WeakTopicRow(topic: topic, progress: tp)
                        }
                    }
                }
                .padding()
                .background(.orange.opacity(0.06), in: RoundedRectangle(cornerRadius: 14))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(.orange.opacity(0.2), lineWidth: 1))
            }
        }
    }

    // MARK: - Quiz History

    private var quizHistorySection: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SectionHeader(title: "היסטוריית בחינות")
            if progress.quizHistory.isEmpty {
                Text("עדיין לא בוצעו בחינות")
                    .font(.subheadline).foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 20)
            } else {
                ForEach(progress.quizHistory.prefix(10)) { entry in
                    QuizHistoryRow(entry: entry)
                }
                if progress.quizHistory.count > 10 {
                    NavigationLink(destination: FullHistoryView()) {
                        Text("הצג הכל (\(progress.quizHistory.count))")
                            .font(.subheadline)
                            .frame(maxWidth: .infinity, alignment: .center)
                    }
                }
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "calendar.badge.plus")
                .font(.system(size: 50))
                .foregroundStyle(.blue.opacity(0.5))
            Text("אין תוכניות לימוד")
                .font(.headline)
            Text("צור תוכנית לימוד מותאמת אישית עם יעד תאריך ונושאים לחזרה")
                .font(.subheadline).foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button {
                showAddPlan = true
            } label: {
                Label("צור תוכנית חדשה", systemImage: "plus")
                    .font(.headline)
                    .padding(.horizontal, 24).padding(.vertical, 12)
                    .background(.blue, in: RoundedRectangle(cornerRadius: 12))
                    .foregroundStyle(.white)
            }
        }
        .padding(.vertical, 30)
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Supporting Views

struct StudyPlanCard: View {
    let plan: StudyPlan
    let onActivate: () -> Void
    let onEdit: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(alignment: .trailing, spacing: 10) {
            HStack {
                if plan.isActive {
                    Text("פעילה")
                        .font(.caption2.bold())
                        .padding(.horizontal, 8).padding(.vertical, 3)
                        .background(.green.opacity(0.15), in: Capsule())
                        .foregroundStyle(.green)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text(plan.title).font(.headline)
                    Text("יעד: \(plan.targetDate.formatted(date: .abbreviated, time: .omitted))")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }

            HStack {
                Text("\(plan.daysRemaining) ימים נותרים")
                    .font(.caption).foregroundStyle(.secondary)
                Spacer()
                Text("יעד יומי: \(plan.dailyGoal) שאלות")
                    .font(.caption).foregroundStyle(.secondary)
            }

            let topicNames = plan.topicIDs.compactMap { TopicID(rawValue: $0)?.displayName }
            if !topicNames.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(topicNames, id: \.self) { name in
                            Text(name).font(.caption2)
                                .padding(.horizontal, 7).padding(.vertical, 3)
                                .background(Color(.systemFill), in: Capsule())
                        }
                    }
                }
            }

            HStack(spacing: 8) {
                Button(role: .destructive, action: onDelete) {
                    Image(systemName: "trash").font(.caption)
                }
                .buttonStyle(.bordered).controlSize(.small)

                Button(action: onEdit) {
                    Text("ערוך")
                }
                .buttonStyle(.bordered).controlSize(.small)

                Spacer()

                if !plan.isActive {
                    Button(action: onActivate) {
                        Text("הפעל").font(.subheadline.bold())
                    }
                    .buttonStyle(.borderedProminent).controlSize(.small)
                }
            }
        }
        .padding()
        .background(.background, in: RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(plan.isActive ? Color.green.opacity(0.3) : .clear, lineWidth: 1.5)
        )
        .shadow(color: .black.opacity(0.05), radius: 5, y: 2)
    }
}

struct WeakTopicRow: View {
    let topic: TopicID
    let progress: TopicProgress

    var body: some View {
        HStack {
            Text("\(Int(progress.percentage))%")
                .font(.callout.bold())
                .foregroundStyle(.orange)
                .frame(width: 44)
            ProgressView(value: progress.percentage, total: 100)
                .tint(.orange)
            Spacer()
            HStack(spacing: 6) {
                Text(topic.displayName).font(.subheadline)
                Image(systemName: topic.icon)
                    .foregroundStyle(colorFromString(topic.color))
            }
        }
    }
}

struct QuizHistoryRow: View {
    let entry: QuizHistoryEntry

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.date.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption2).foregroundStyle(.tertiary)
                Text(formatDuration(entry.durationSeconds))
                    .font(.caption2).foregroundStyle(.secondary)
            }
            Spacer()
            if let topicRaw = entry.topicID, let topic = TopicID(rawValue: topicRaw) {
                Text(topic.displayName)
                    .font(.caption2)
                    .padding(.horizontal, 6).padding(.vertical, 2)
                    .background(colorFromString(topic.color).opacity(0.12), in: Capsule())
                    .foregroundStyle(colorFromString(topic.color))
            } else {
                Text("מעורב").font(.caption2).foregroundStyle(.secondary)
            }
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(entry.score)/\(entry.total)")
                    .font(.subheadline.bold())
                Text("\(Int(entry.percentage))%")
                    .font(.caption)
                    .foregroundStyle(entry.percentage >= 70 ? .green : .orange)
            }
        }
        .padding(10)
        .background(.background, in: RoundedRectangle(cornerRadius: 10))
    }

    private func formatDuration(_ s: Double) -> String {
        let m = Int(s) / 60; let sec = Int(s) % 60
        return "\(m):\(String(format: "%02d", sec))"
    }
}

struct FullHistoryView: View {
    @Environment(UserProgress.self) private var progress

    var body: some View {
        List(progress.quizHistory) { entry in
            QuizHistoryRow(entry: entry)
                .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
        }
        .listStyle(.plain)
        .navigationTitle("היסטוריית בחינות")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Study Plan Form

enum StudyPlanFormMode {
    case add
    case edit(StudyPlan)
}

struct StudyPlanFormView: View {
    @Environment(UserProgress.self) private var progress
    @Environment(\.dismiss) private var dismiss
    let mode: StudyPlanFormMode

    @State private var title = ""
    @State private var targetDate = Date().addingTimeInterval(30 * 86400)
    @State private var selectedTopics: Set<String> = []
    @State private var dailyGoal = 20
    @State private var showValidation = false

    private var isEditing: Bool {
        if case .edit = mode { return true }
        return false
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("שם התוכנית") {
                    TextField("לדוגמה: הכנה לאמירנט Q1", text: $title)
                        .multilineTextAlignment(.trailing)
                }
                Section("תאריך יעד") {
                    DatePicker("תאריך", selection: $targetDate, in: Date()..., displayedComponents: .date)
                        .datePickerStyle(.graphical)
                        .environment(\.locale, Locale(identifier: "he"))
                }
                Section {
                    ForEach(TopicID.allCases, id: \.self) { topic in
                        Button {
                            if selectedTopics.contains(topic.rawValue) {
                                selectedTopics.remove(topic.rawValue)
                            } else {
                                selectedTopics.insert(topic.rawValue)
                            }
                        } label: {
                            HStack {
                                Image(systemName: selectedTopics.contains(topic.rawValue)
                                      ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(selectedTopics.contains(topic.rawValue) ? .blue : .secondary)
                                Spacer()
                                HStack(spacing: 8) {
                                    Text(topic.displayName).foregroundStyle(.primary)
                                    Image(systemName: topic.icon)
                                        .foregroundStyle(colorFromString(topic.color))
                                }
                            }
                        }
                    }
                } header: {
                    Text("נושאים לחיזוק")
                } footer: {
                    Text("בחר את הנושאים שברצונך לכלול בתוכנית")
                }
                Section {
                    Stepper("יעד יומי: \(dailyGoal) שאלות", value: $dailyGoal, in: 5...100, step: 5)
                } header: {
                    Text("יעד יומי")
                }
            }
            .navigationTitle(isEditing ? "עריכת תוכנית" : "תוכנית חדשה")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) { Button("ביטול") { dismiss() } }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(isEditing ? "שמור" : "צור") { save() }.fontWeight(.semibold)
                }
            }
            .alert("שגיאה", isPresented: $showValidation) {
                Button("אישור", role: .cancel) {}
            } message: {
                Text("יש להזין שם לתוכנית.")
            }
            .onAppear { prefill() }
        }
    }

    private func prefill() {
        if case .edit(let plan) = mode {
            title = plan.title
            targetDate = plan.targetDate
            selectedTopics = Set(plan.topicIDs)
            dailyGoal = plan.dailyGoal
        }
    }

    private func save() {
        guard !title.trimmingCharacters(in: .whitespaces).isEmpty else {
            showValidation = true; return
        }
        switch mode {
        case .add:
            let plan = StudyPlan(
                title: title.trimmingCharacters(in: .whitespaces),
                targetDate: targetDate,
                topicIDs: Array(selectedTopics),
                dailyGoal: dailyGoal
            )
            progress.addStudyPlan(plan)
        case .edit(let original):
            var updated = original
            updated.title = title.trimmingCharacters(in: .whitespaces)
            updated.targetDate = targetDate
            updated.topicIDs = Array(selectedTopics)
            updated.dailyGoal = dailyGoal
            progress.updateStudyPlan(updated)
        }
        dismiss()
    }
}
