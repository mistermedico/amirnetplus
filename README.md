# AmirNet Plus

Expo app for Amirnet English-test preparation on iOS, Android, and Web.

The app is focused on Amirnet-style practice: Sentence Completion, Restatement,
Reading Comprehension, vocabulary, and grammar in context. The full simulation
mode is built as a 39-minute, 6-section exam with English prompts shown LTR and
Hebrew interface text shown RTL.

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
