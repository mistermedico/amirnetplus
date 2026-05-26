import Foundation
import Observation

enum UserRole: String, Codable, CaseIterable {
    case admin = "admin"
    case student = "student"

    var displayName: String {
        switch self {
        case .admin: return "מנהל"
        case .student: return "תלמיד"
        }
    }
}

struct AppUser: Codable, Identifiable {
    var id: UUID = UUID()
    var username: String
    var passwordHash: String
    var role: UserRole
    var displayName: String
    var createdAt: Date = Date()
}

@Observable
class AuthManager {
    var users: [AppUser] = []
    var currentUser: AppUser? = nil
    var isAuthenticated: Bool = false
    var hasSeenLanding: Bool = false

    private let usersKey = "appUsers_v1"
    private let landingKey = "hasSeenLanding"

    init() {
        hasSeenLanding = UserDefaults.standard.bool(forKey: landingKey)
        load()
    }

    var isAdmin: Bool { currentUser?.role == .admin }

    func login(username: String, password: String) -> Bool {
        let h = hash(password)
        guard let user = users.first(where: {
            $0.username.lowercased() == username.lowercased() && $0.passwordHash == h
        }) else { return false }
        currentUser = user
        isAuthenticated = true
        return true
    }

    func logout() {
        currentUser = nil
        isAuthenticated = false
    }

    func markLandingSeen() {
        hasSeenLanding = true
        UserDefaults.standard.set(true, forKey: landingKey)
    }

    @discardableResult
    func createUser(username: String, password: String, role: UserRole, displayName: String) -> Bool {
        guard !users.contains(where: { $0.username.lowercased() == username.lowercased() }) else { return false }
        let user = AppUser(username: username, passwordHash: hash(password), role: role, displayName: displayName)
        users.append(user)
        save()
        return true
    }

    func deleteUser(id: UUID) {
        users.removeAll { $0.id == id }
        save()
    }

    func updateUserRole(id: UUID, role: UserRole) {
        if let idx = users.firstIndex(where: { $0.id == id }) {
            users[idx].role = role
            save()
        }
    }

    func changePassword(id: UUID, newPassword: String) {
        if let idx = users.firstIndex(where: { $0.id == id }) {
            users[idx].passwordHash = hash(newPassword)
            if currentUser?.id == id { currentUser = users[idx] }
            save()
        }
    }

    func verifyPassword(_ password: String) -> Bool {
        hash(password) == currentUser?.passwordHash
    }

    // djb2 hash – good enough for local PIN/password storage
    private func hash(_ input: String) -> String {
        var h: UInt64 = 5381
        for scalar in input.unicodeScalars {
            h = (h &<< 5) &+ h &+ UInt64(scalar.value)
        }
        return String(h, radix: 16)
    }

    private func save() {
        if let data = try? JSONEncoder().encode(users) {
            UserDefaults.standard.set(data, forKey: usersKey)
        }
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: usersKey),
              let saved = try? JSONDecoder().decode([AppUser].self, from: data) else {
            setupDefaultAdmin()
            return
        }
        users = saved
    }

    private func setupDefaultAdmin() {
        let admin = AppUser(
            username: "admin",
            passwordHash: hash("admin123"),
            role: .admin,
            displayName: "מנהל המערכת"
        )
        users = [admin]
        save()
    }
}
