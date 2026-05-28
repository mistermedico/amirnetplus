# AmirNet Plus

Expo app for Amirnet English-test preparation on iOS, Android, and Web.

The app is focused on Amirnet-style practice: Sentence Completion, Restatement,
Reading Comprehension, vocabulary, and grammar in context. The full simulation
mode is built as a 39-minute, 6-section exam with English prompts shown LTR and
Hebrew interface text shown RTL.

Admin controls include student registration, maintenance mode, pass grade,
default daily goal, default timer/question count, and whether students may use
free practice, adaptive practice, or only the full Amirnet simulation.
The admin Control Center also provides quick system locks, group broadcasts,
at-risk student nudges, global daily-goal updates, and shortcuts into the main
management screens.

## Supabase

This repo is linked to the `amirnetplus` Supabase project. Runtime cloud sync
uses the `app_state` table created by the migration in `supabase/migrations`.

Create a local `.env` from `.env.example`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

If these values are missing, the app falls back to local device storage.

## Run

```bash
npm install
npm start
```

Then choose:

- `i` for iOS Simulator on macOS
- `a` for Android Emulator
- `w` for Web

Direct commands:

```bash
npm run ios
npm run android
npm run web
```

Expo Web usually opens at a local address such as `http://localhost:8081`.
If that port is busy, Expo will choose another port and print it in the terminal.

## Validate

```bash
npm run lint
npm run check:deps
npm run build:web
```
