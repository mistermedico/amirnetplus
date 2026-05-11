import SwiftUI

@main
struct AmirNetPlusApp: App {
    @State private var userProgress = UserProgress()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(userProgress)
                .environment(\.layoutDirection, .rightToLeft)
        }
    }
}
