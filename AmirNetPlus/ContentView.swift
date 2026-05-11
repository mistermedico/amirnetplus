import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Int = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("בית", systemImage: "house.fill")
                }
                .tag(0)

            TopicsView()
                .tabItem {
                    Label("נושאים", systemImage: "books.vertical.fill")
                }
                .tag(1)

            QuizSetupView()
                .tabItem {
                    Label("בחינה", systemImage: "checkmark.circle.fill")
                }
                .tag(2)

            StudyProgressView()
                .tabItem {
                    Label("התקדמות", systemImage: "chart.bar.fill")
                }
                .tag(3)
        }
        .tint(.blue)
    }
}

#Preview {
    ContentView()
        .environment(UserProgress())
}
