# 🎮 The Restricted Speaker

A fast-paced real-time multiplayer word guessing game where communication becomes the biggest challenge.

In **The Restricted Speaker**, players are divided into **Hint-Givers** and **Guessers**. The goal sounds simple — help your teammates guess a secret word. The twist? Every round, the Hint-Giver must follow a random and often hilarious speaking constraint that completely changes how clues can be given.

Built as a responsive Single Page Application (SPA), the game supports real-time synchronization, spectator interactions, and dynamic multiplayer gameplay powered by Firebase Realtime Database.

---

# ✨ Features

## ⚡ Real-Time Multiplayer

* Instant synchronization between all connected players
* Live room updates using Firebase Realtime Database
* Smooth multiplayer gameplay across devices

## 🎭 Dynamic Constraint System

Each round introduces a random speaking restriction for the Hint-Giver, creating unpredictable and funny gameplay.

### Available Constraints

| Constraint         | Description                            |
| ------------------ | -------------------------------------- |
| 🚫 The Vowel-Less  | Cannot use the letter **E**            |
| ☝️ One-Word Wonder | Hint must contain exactly one word     |
| 👻 The Narrative   | Hint must sound like a spooky story    |
| ❓ The Interrogator | Hint must end with a question mark     |
| 🎵 The Rhymer      | Hint should rhyme with the target word |
| 🌀 The Abstract    | No nouns allowed                       |
| 🔤 The Alliterator | Every word starts with the same letter |
| 📵 The Purist      | Emojis are banned                      |

---

# 🗳️ Constraint Voting System

Guessers can challenge whether a clue follows the assigned rule.

* Valid hints continue the round
* Invalid hints reduce the Hint-Giver's score
* Encourages fair and creative gameplay

---

# 👀 Spectator Mode

Users can join rooms as spectators and:

* Watch gameplay live
* View secret target words
* See guesses without blur restrictions
* Send floating emoji reactions in real time

---

# 📱 Progressive Web App (PWA)

The game can be installed directly to a mobile home screen for an app-like experience.

Features include:

* Responsive mobile UI
* Fast loading
* Full-screen experience
* Offline-ready assets

---

# 🏆 Scoring System

## Guesser Rewards

| Action                    | Points |
| ------------------------- | ------ |
| Correct guess on 1st hint | +100   |
| Correct guess on 2nd hint | +75    |
| Correct guess on 3rd hint | +50    |

## Hint-Giver Rewards

| Action                        | Points |
| ----------------------------- | ------ |
| Word guessed correctly        | +60    |
| Nobody guesses correctly      | -30    |
| Manual pass used              | -50    |
| Invalid clue voted by players | -20    |

---

# 🔥 Tech Stack

* HTML5
* CSS3
* Vanilla JavaScript
* Firebase Realtime Database
* Firebase Anonymous Authentication
* Progressive Web App APIs

---

# 🔧 Firebase Setup

## 1. Create Firebase Project

Visit:

[Firebase Console](https://console.firebase.google.com?utm_source=chatgpt.com)

Create a new project named:

```txt id="pwrlv5"
restricted-speaker
```

---

## 2. Enable Anonymous Authentication

Go to:

```txt id="5m45t4"
Build → Authentication → Sign-in Method
```

Enable:

* Anonymous Authentication

---

## 3. Enable Realtime Database

Navigate to:

```txt id="4c6n1o"
Build → Realtime Database
```

Create database in:

* Test Mode

---

## 4. Apply Database Rules

Replace rules with:

```json id="8z9w7y"
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

---

## 5. Connect Firebase Config

Register a web app and copy your Firebase config keys.

You can either:

### Method A

Paste keys inside:

```txt id="mzh8j5"
firebase-config.js
```

### Method B

Use the in-app settings panel (`⚙️`) and save credentials locally using localStorage.

---

# 💻 Running Locally

Because the project uses ES Modules, it must be served through a local server.

## Using NPX

```bash id="4yx1kk"
npx live-server
```

or

```bash id="3pkjlwm"
npx http-server
```

---

## Using Python

```bash id="e0v5u8"
python -m http.server 8000
```

Open:

```txt id="8r1f5q"
http://localhost:8000
```

---

# 📂 Project Structure

```txt id="k6vrsi"
├── index.html
├── style.css
├── app.js
├── constraints.js
├── wordbank.js
├── firebase-config.js
├── sw.js
├── manifest.json
├── logo.png
└── README.md
```

---

# 🚀 Future Improvements

* Voice chat integration
* AI-generated word packs
* Ranked matchmaking
* Private party rooms
* Custom constraint creator
* Leaderboards
* Mobile gesture controls

---

# 📜 License

This project is open-source and available for educational and personal use.

---

# 🎯 Final Note

The Restricted Speaker combines party-game chaos with creative communication challenges to create a unique multiplayer experience that is both competitive and hilarious.
