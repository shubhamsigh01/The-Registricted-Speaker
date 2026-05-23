# 🎮 The Restricted Speaker

**"The Restricted Speaker"** is a real-time multiplayer party word-guessing game built as a responsive Single Page Application (SPA). Split into **Hint-Givers** and **Guessers**, players must collaborate to guess secret target words—but the Hint-Giver is bound by a randomized, hilarious linguistic constraint that changes every round!

---

## 🚀 Features

- **Real-Time Synchronized Gameplay:** Instant state sync across all players via Firebase Realtime Database.
- **8 Dynamic Linguistic Constraints:** Includes constraint checks for "The Vowel-Less" (no 'E's), "One-Word Wonder" (exactly 1 word), "The Interrogator" (ends in '?'), "The Alliterator" (same first letter), and more.
- **In-App Dynamic Configuration:** Play immediately by setting your database keys via the gear icon (`⚙️`) in the browser. Credentials are saved locally to `localStorage`.
- **Constraint Voting:** Guessers can vote on the validity of the Hint-Giver's clues. Violations result in point penalties.
- **Spectator Mode:** Join the room as a viewer, see the secret words, track guesses unblurred, and react with floating emojis in real-time.
- **PWA Ready:** Add the game directly to your phone's home screen for a premium mobile-native feel.

---

## 🔧 Firebase Setup Instructions

Follow these steps to connect your own database backend:

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Click **Add Project** and name it `restricted-speaker`.

2. **Enable Anonymous Authentication:**
   - In the left menu, navigate to **Build** > **Authentication**.
   - Click **Get Started**, choose the **Sign-in method** tab.
   - Click **Anonymous**, toggle it to **Enabled**, and save.

3. **Enable Realtime Database:**
   - Go to **Build** > **Realtime Database**.
   - Click **Create Database**, choose your database location, and click **Next**.
   - Select **Start in test mode** and click **Enable**.

4. **Apply Security Rules:**
   - Go to the **Rules** tab of your Realtime Database.
   - Replace the default rules with the following JSON and click **Publish**:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

5. **Connect the App:**
   - Under Project Overview, click the **Web icon** (`</>`) to register a web app.
   - Copy the `firebaseConfig` keys from the setup script.
   - **Method A:** Open `firebase-config.js` and paste your keys into the config object.
   - **Method B (No Code Required):** Run the app locally, click the gear icon (`⚙️`) at the top right of the landing page, paste your keys, and click **Save Settings**.

---

## 💻 Running the App Locally

Since the app uses ES modules, you must serve it via a local web server (opening `index.html` directly in the browser using the `file://` protocol will cause CORS/module block errors).

### Using Node (NPX)
In the project directory, run:
```bash
npx live-server
```
or
```bash
npx http-server
```

### Using Python
If you have Python installed, run:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

---

## 🏆 Game Rules & Scoring

### Scoring System
- **Guesser rewards:**
  - Guessed correct on **1st Hint**: `+100 pts`
  - Guessed correct on **2nd Hint**: `+75 pts`
  - Guessed correct on **3rd Hint**: `+50 pts`
- **Hint-Giver rewards:**
  - Guesser gets word correct: `+60 pts`
  - Nobody guesses correct: `-30 pts`
  - Manual Pass activated: `-50 pts`
  - Hint voted "Invalid" by guessers: `-20 pts` (deducted from round score)

### The 8 Constraints
1. 🚫 **The Vowel-Less:** No words containing the letter 'E' (case-insensitive).
2. ☝️ **The One-Word Wonder:** Entire hint must be exactly one word (no spaces).
3. 👻 **The Narrative:** Clue must be written as a spooky horror story (min 10 characters).
4. ❓ **The Interrogator:** Hint must be phrased as a question ending with '?'.
5. 🎵 **The Rhymer:** Hint must end with a word that rhymes with the target word's last syllable (honor system).
6. 🌀 **The Abstract:** You cannot use any nouns—describe actions, feelings, and attributes only (honor system).
7. 🔤 **The Alliterator:** Every word in the hint must start with the exact same letter.
8. 📵 **The Purist:** Pure text only. Emojis are strictly banned.
