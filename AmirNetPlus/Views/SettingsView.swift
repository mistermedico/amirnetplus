import SwiftUI

struct SettingsView: View {
    @Environment(UserProgress.self) private var progress
    @State private var userName = ""
    @State private var dailyGoal = 20
    @State private var notificationsEnabled = true
    @State private var showResetConfirm = false
    @State private var showExportSheet = false
    @State private var exportText = ""
    @State private var saved = false

    var body: some View {
        NavigationStack {
            Form {
                profileSection
                studySection
                statsSection
                dataSection
                aboutSection
            }
            .navigationTitle("הגדרות")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        saveSettings()
                    } label: {
                        Text(saved ? "נשמר ✓" : "שמור")
                            .foregroundStyle(saved ? .green : .blue)
                    }
                }
            }
            .alert("איפוס התקדמות", isPresented: $showResetConfirm) {
                Button("אפס הכל", role: .destructive) {
                    progress.resetProgress()
                }
                Button("ביטול", role: .cancel) {}
            } message: {
                Text("פעולה זו תמחק את כל ההתקדמות, ההיסטוריה וההישגים שלך. הפעולה אינה הפיכה.")
            }
            .sheet(isPresented: $showExportSheet) {
                ExportView(text: exportText)
            }
            .onAppear {
                userName = progress.userName
                dailyGoal = progress.dailyGoal
                notificationsEnabled = progress.notificationsEnabled
            }
        }
    }

    // MARK: - Sections

    private var profileSection: some View {
        Section {
            HStack {
                Spacer()
                TextField("הזן שמך", text: $userName)
                    .multilineTextAlignment(.trailing)
                    .onChange(of: userName) { _, _ in saved = false }
                Image(systemName: "person.circle.fill")
                    .font(.title2)
                    .foregroundStyle(.blue)
            }
        } header: {
            Text("פרופיל")
        }
    }

    private var studySection: some View {
        Section {
            Stepper("יעד יומי: \(dailyGoal) שאלות", value: $dailyGoal, in: 5...100, step: 5)
                .onChange(of: dailyGoal) { _, _ in saved = false }

            Toggle("תזכורות לימוד יומיות", isOn: $notificationsEnabled)
                .onChange(of: notificationsEnabled) { _, _ in saved = false }
        } header: {
            Text("לימוד")
        } footer: {
            Text("התזכורות מסייעות לשמור על רצף לימוד יומי")
        }
    }

    private var statsSection: some View {
        Section {
            StatRow(label: "סה\"כ שאלות נענו", value: "\(progress.totalAnswered)")
            StatRow(label: "תשובות נכונות", value: "\(progress.totalCorrect)")
            StatRow(label: "אחוז הצלחה כולל",
                    value: progress.totalAnswered > 0 ? "\(Int(progress.overallPercentage))%" : "-")
            StatRow(label: "ימי רצף", value: "\(progress.streakDays)")
            StatRow(label: "שאלות שמורות", value: "\(progress.bookmarkedQuestionIDs.count)")
            StatRow(label: "שאלות מותאמות אישית", value: "\(progress.customQuestions.count)")
            StatRow(label: "תוכניות לימוד", value: "\(progress.studyPlans.count)")
            StatRow(label: "בחינות שהושלמו", value: "\(progress.quizHistory.count)")
        } header: {
            Text("סטטיסטיקות")
        }
    }

    private var dataSection: some View {
        Section {
            Button {
                exportText = generateExportText()
                showExportSheet = true
            } label: {
                HStack {
                    Spacer()
                    Text("ייצא נתונים")
                    Image(systemName: "square.and.arrow.up")
                }
            }

            Button(role: .destructive) {
                showResetConfirm = true
            } label: {
                HStack {
                    Spacer()
                    Label("איפוס כל ההתקדמות", systemImage: "arrow.counterclockwise")
                }
            }
        } header: {
            Text("ניהול נתונים")
        } footer: {
            Text("האיפוס ימחק את ההתקדמות אך ישמור שאלות מותאמות אישית ותוכניות לימוד")
        }
    }

    private var aboutSection: some View {
        Section {
            HStack {
                Spacer()
                Text("AmirNet Plus 1.0")
                    .foregroundStyle(.secondary)
            }
            HStack {
                Spacer()
                Text("iOS 17+ | SwiftUI")
                    .foregroundStyle(.secondary)
            }
            HStack {
                Spacer()
                Text("הכנה לבחינת אמירנט")
                    .foregroundStyle(.secondary)
            }
        } header: {
            Text("אודות")
        }
    }

    // MARK: - Actions

    private func saveSettings() {
        progress.updateSettings(
            dailyGoal: dailyGoal,
            notifications: notificationsEnabled,
            userName: userName
        )
        withAnimation {
            saved = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            saved = false
        }
    }

    private func generateExportText() -> String {
        var lines = ["AmirNet Plus - דוח התקדמות", "תאריך: \(Date().formatted())", ""]
        lines.append("=== סטטיסטיקות כלליות ===")
        lines.append("סה\"כ שאלות: \(progress.totalAnswered)")
        lines.append("תשובות נכונות: \(progress.totalCorrect)")
        lines.append("אחוז הצלחה: \(Int(progress.overallPercentage))%")
        lines.append("ימי רצף: \(progress.streakDays)")
        lines.append("")
        lines.append("=== התקדמות לפי נושא ===")
        for topic in TopicID.allCases {
            if let tp = progress.topicProgress[topic.rawValue], tp.answeredCount > 0 {
                lines.append("\(topic.displayName): \(tp.answeredCount) שאלות, \(Int(tp.percentage))%")
            }
        }
        lines.append("")
        lines.append("=== היסטוריית בחינות (10 אחרונות) ===")
        for entry in progress.quizHistory.prefix(10) {
            lines.append("\(entry.date.formatted(date: .abbreviated, time: .omitted)): \(entry.score)/\(entry.total) (\(Int(entry.percentage))%)")
        }
        return lines.joined(separator: "\n")
    }
}

struct StatRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(value)
                .font(.subheadline.bold())
                .foregroundStyle(.blue)
            Spacer()
            Text(label)
                .font(.subheadline)
        }
    }
}

struct ExportView: View {
    @Environment(\.dismiss) private var dismiss
    let text: String

    var body: some View {
        NavigationStack {
            ScrollView {
                Text(text)
                    .font(.system(.caption, design: .monospaced))
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .trailing)
                    .multilineTextAlignment(.trailing)
            }
            .navigationTitle("דוח התקדמות")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("סגור") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    ShareLink(item: text) {
                        Image(systemName: "square.and.arrow.up")
                    }
                }
            }
        }
    }
}
