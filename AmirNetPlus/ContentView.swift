import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Int = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem { Label("בית", systemImage: "house.fill") }
                .tag(0)

            TopicsView()
                .tabItem { Label("נושאים", systemImage: "books.vertical.fill") }
                .tag(1)

            QuizSetupView()
                .tabItem { Label("בחינה", systemImage: "checkmark.circle.fill") }
                .tag(2)

            StudyPlanView()
                .tabItem { Label("תכנון", systemImage: "calendar.badge.clock") }
                .tag(3)

            BookmarksView()
                .tabItem { Label("שמורות", systemImage: "bookmark.fill") }
                .tag(4)

            ManagementView()
                .tabItem { Label("ניהול", systemImage: "slider.horizontal.3") }
                .tag(5)
        }
        .tint(.blue)
    }
}

// MARK: - Management Hub

struct ManagementView: View {
    @Environment(UserProgress.self) private var progress

    var body: some View {
        NavigationStack {
            List {
                Section {
                    NavigationLink(destination: AdminView()) {
                        ManagementRow(
                            icon: "square.and.pencil",
                            color: .blue,
                            title: "ניהול שאלות",
                            subtitle: "\(QuestionsData.all.count) מובנות · \(progress.customQuestions.count) מותאמות"
                        )
                    }
                    NavigationLink(destination: StudyPlanView()) {
                        ManagementRow(
                            icon: "calendar.badge.clock",
                            color: .green,
                            title: "תוכניות לימוד",
                            subtitle: "\(progress.studyPlans.count) תוכניות · יעד: \(progress.dailyGoal) שאלות/יום"
                        )
                    }
                    NavigationLink(destination: BookmarksView()) {
                        ManagementRow(
                            icon: "bookmark.fill",
                            color: .orange,
                            title: "שאלות שמורות",
                            subtitle: "\(progress.bookmarkedQuestionIDs.count) שאלות שמורות"
                        )
                    }
                } header: {
                    Text("תוכן ולמידה")
                }

                Section {
                    NavigationLink(destination: StudyProgressView()) {
                        ManagementRow(
                            icon: "chart.bar.fill",
                            color: .purple,
                            title: "התקדמות וגרפים",
                            subtitle: "\(Int(progress.overallPercentage))% הצלחה · \(progress.quizHistory.count) בחינות"
                        )
                    }
                    NavigationLink(destination: FullHistoryView()) {
                        ManagementRow(
                            icon: "clock.arrow.circlepath",
                            color: .indigo,
                            title: "היסטוריית בחינות",
                            subtitle: "\(progress.quizHistory.count) בחינות שהושלמו"
                        )
                    }
                } header: {
                    Text("ניתוח וסטטיסטיקות")
                }

                Section {
                    NavigationLink(destination: SettingsView()) {
                        ManagementRow(
                            icon: "gearshape.fill",
                            color: .gray,
                            title: "הגדרות",
                            subtitle: progress.userName.isEmpty ? "שם משתמש, יעד יומי, נתונים" : progress.userName
                        )
                    }
                } header: {
                    Text("מערכת")
                }

                // Quick stats summary
                Section {
                    quickSummary
                } header: {
                    Text("סיכום מהיר")
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("ניהול")
            .navigationBarTitleDisplayMode(.large)
        }
    }

    private var quickSummary: some View {
        VStack(spacing: 10) {
            HStack {
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text(progress.userName.isEmpty ? "AmirNet Plus" : progress.userName)
                        .font(.headline)
                    Text("ביצועים כלליים")
                        .font(.caption).foregroundStyle(.secondary)
                }
                ZStack {
                    Circle()
                        .trim(from: 0, to: progress.overallPercentage / 100)
                        .stroke(Color.blue, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                        .frame(width: 50, height: 50)
                    Circle()
                        .stroke(Color(.systemFill), lineWidth: 6)
                        .frame(width: 50, height: 50)
                    Text("\(Int(progress.overallPercentage))%")
                        .font(.caption2.bold())
                }
            }

            Divider()

            HStack {
                summaryItem("\(progress.streakDays)", "ימי רצף", .orange)
                Divider().frame(height: 30)
                summaryItem("\(progress.totalAnswered)", "שאלות", .blue)
                Divider().frame(height: 30)
                summaryItem("\(progress.unlockedAchievements.count)", "הישגים", .yellow)
                Divider().frame(height: 30)
                summaryItem("\(progress.weakTopics.count)", "לחיזוק", .red)
            }
        }
        .padding(.vertical, 4)
    }

    private func summaryItem(_ value: String, _ label: String, _ color: Color) -> some View {
        VStack(spacing: 2) {
            Text(value).font(.callout.bold()).foregroundStyle(color)
            Text(label).font(.caption2).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct ManagementRow: View {
    let icon: String
    let color: Color
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: 14) {
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text(title).font(.subheadline.weight(.medium))
                Text(subtitle).font(.caption).foregroundStyle(.secondary)
            }
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(color.opacity(0.15))
                    .frame(width: 36, height: 36)
                Image(systemName: icon)
                    .font(.callout)
                    .foregroundStyle(color)
            }
        }
        .padding(.vertical, 2)
    }
}

#Preview {
    ContentView().environment(UserProgress())
}
