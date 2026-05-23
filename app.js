/**
 * The Restricted Speaker — Main App Controller
 * Integrates Firebase RTDB, game loop, UI rendering, and PWA capabilities.
 */

import { initFirebase, db, auth, isFirebaseReady } from "./firebase-config.js";
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set, get, update, onValue, push, remove, runTransaction, onDisconnect } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { CONSTRAINTS, validateHint } from "./constraints.js";
import { CATEGORIES, getRandomWord, getRandomCategory, parseCustomWords } from "./wordbank.js";

// --- Category Themes, Modifiers & Chaos Events Config ---
const CATEGORY_THEMES = {
  "Bollywood & Memes": { emoji:"🎬", gradient:"linear-gradient(135deg,#b8860b,#c0392b)" },
  "Cricket & Gully Games": { emoji:"🏏", gradient:"linear-gradient(135deg,#1a6b3c,#1a5276)" },
  "Indian Street Food": { emoji:"🍛", gradient:"linear-gradient(135deg,#e74c3c,#f39c12)" },
  "School Life": { emoji:"📚", gradient:"linear-gradient(135deg,#8e44ad,#6c3483)" },
  "Indian Wedding Chaos": { emoji:"💒", gradient:"linear-gradient(135deg,#ff6b6b,#feca57)" },
  "TV & Cartoons": { emoji:"📺", gradient:"linear-gradient(135deg,#fd79a8,#6c5ce7)" },
  "JEE/NEET Trauma": { emoji:"😭", gradient:"linear-gradient(135deg,#636e72,#2d3436)" },
  "Delhi Slang": { emoji:"🗣️", gradient:"linear-gradient(135deg,#00cec9,#0984e3)" }
};
const MODIFIERS = ["🎤 Speak like a politician","🤫 Whisper only","🎵 Sing your hints","😶 Act it out silently","🤐 No English words"];
const CHAOS_EVENTS = ["⚡ Everyone must clap while guessing!","🔥 SPEED ROUND: Timer halved!","😂 Hint-giver uses sound effects only!","🕺 Hint-giver must dance while hinting!"];

// --- Game State Globals ---
let myUid = null;
let myName = "";
let roomCode = "";
let isHost = false;
let isSpectator = false;
let currentRoomData = null;
let dbListeners = []; // Holds off-subscriptions for cleanup
let timerInterval = null;
let lastTimerWarn = false;
let confettiSystem = null;
let roleRevealTimeoutActive = false;

// --- Offline Mode State ---
let isOfflineMode = false;
let offlinePlayers = []; // array of { name, score }
let offlineGiverIndex = 0;
let offlineRound = 1;
let offlineMaxRounds = 5;
let offlineDuration = 30;
let offlineCategories = [];
let offlineTargetWord = "";
let offlineCategory = "";
let offlineConstraint = null;
let offlineTimerStartedAt = 0;
let offlineViolationDeduction = 0;
let offlineGameHistory = [];
let offlineRoundScores = {};
let offlineWinnerName = "";
let offlineWinnerId = "";

// --- DOM Elements ---
const screens = {
  home: document.getElementById("screen-home"),
  lobby: document.getElementById("screen-lobby"),
  roleReveal: document.getElementById("screen-role-reveal"),
  hinting: document.getElementById("screen-hinting"),
  guessing: document.getElementById("screen-guessing"),
  results: document.getElementById("screen-results"),
  gameOver: document.getElementById("screen-game-over"),
  // Local Play mode screens
  "local-setup": document.getElementById("screen-local-setup"),
  "local-handoff": document.getElementById("screen-local-handoff"),
  "local-peek": document.getElementById("screen-local-peek"),
  "local-hinting": document.getElementById("screen-local-hinting"),
  "local-round-result": document.getElementById("screen-local-round-result"),
  "local-game-over": document.getElementById("screen-local-game-over")
};



// --- Confetti Engine ---
class CanvasConfetti {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.colors = ["#FFD60A", "#00F5D4", "#FF4F5E", "#3A86FF", "#E0E1DD"];
    this.particles = [];
    this.active = false;
    window.addEventListener("resize", () => this.resize());
    this.resize();
  }
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  start() {
    if (this.active) return;
    this.active = true;
    this.particles = [];
    for (let i = 0; i < 120; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height - this.canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * this.canvas.height,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }
    this.animate();
  }
  stop() {
    this.active = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  animate() {
    if (!this.active) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let finished = true;
    for (let p of this.particles) {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.tiltAngle);
      p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 15;
      if (p.y < this.canvas.height) {
        finished = false;
      }
      this.ctx.beginPath();
      this.ctx.lineWidth = p.r;
      this.ctx.strokeStyle = p.color;
      this.ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      this.ctx.stroke();
    }
    if (finished) {
      this.stop();
    } else {
      requestAnimationFrame(() => this.animate());
    }
  }
}

// --- Loading Screen ---
function showLoadingScreen(message = "Setting up the game...") {
  const ls = document.getElementById("loading-screen");
  ls.classList.remove("hidden", "fade-out");
  document.getElementById("loader-text").textContent = message;
}

function hideLoadingScreen() {
  const ls = document.getElementById("loading-screen");
  ls.classList.add("fade-out");
  setTimeout(() => {
    ls.classList.add("hidden");
    ls.classList.remove("fade-out");
  }, 500);
}

// --- App Entry & Firebase Authentication ---
window.addEventListener("DOMContentLoaded", () => {
  confettiSystem = new CanvasConfetti(document.getElementById("confetti-canvas"));

  showLoadingScreen("Connecting to game server...");

  // Firebase config is hardcoded — always initialises successfully.
  const ready = initFirebase();
  if (ready) {
    authenticateUser();
  } else {
    hideLoadingScreen();
    alert("Firebase failed to initialise. Check the browser console for details.");
  }

  bindUIEvents();
  loadSavedName();
});

function loadSavedName() {
  const saved = localStorage.getItem("restricted_speaker_nickname");
  if (saved) {
    document.getElementById("player-name").value = saved;
    myName = saved;
  }
}

function authenticateUser() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      myUid = user.uid;
      console.log("Logged in anonymously. UID:", myUid);
      hideLoadingScreen();
    } else {
      signInAnonymously(auth)
        .then((cred) => {
          myUid = cred.user.uid;
          console.log("Signed in anonymously. UID:", myUid);
          hideLoadingScreen();
        })
        .catch(err => {
          console.error("Auth failed:", err);
          hideLoadingScreen();
          alert("Could not login anonymously. Details: " + err.message + "\n\nPlease check that Anonymous Authentication is enabled in your Firebase Console.");
        });
    }
  });
}



// --- Navigation / Screen Switching ---
function showScreen(screenId) {
  Object.keys(screens).forEach(id => {
    if (id === screenId) {
      screens[id].classList.add("active");
    } else {
      screens[id].classList.remove("active");
    }
  });
}

// --- Lobby Setup & Event Listeners ---
function bindUIEvents() {
  const inputName = document.getElementById("player-name");
  
  // Nickname Input handler
  inputName.addEventListener("input", (e) => {
    myName = e.target.value.trim().substring(0, 16);
    localStorage.setItem("restricted_speaker_nickname", myName);
  });
  
  // Show / Hide Join Input
  const btnShowJoin = document.getElementById("btn-show-join");
  const joinCodeContainer = document.getElementById("join-code-container");
  const btnConfirmJoin = document.getElementById("btn-confirm-join");
  const btnCancelJoin = document.getElementById("btn-cancel-join");
  const btnCreateLobby = document.getElementById("btn-create-lobby");
  const joinActionContainer = document.getElementById("join-action-container");

  btnShowJoin.addEventListener("click", () => {
    joinCodeContainer.style.display = "flex";
    btnCreateLobby.style.display = "none";
    btnShowJoin.style.display = "none";
    joinActionContainer.style.display = "flex";
    document.getElementById("room-code-input").focus();
  });

  btnCancelJoin.addEventListener("click", () => {
    joinCodeContainer.style.display = "none";
    btnCreateLobby.style.display = "inline-flex";
    btnShowJoin.style.display = "inline-flex";
    joinActionContainer.style.display = "none";
  });

  // Create Room
  btnCreateLobby.addEventListener("click", async () => {
    if (!verifyName()) return;
    if (!isFirebaseReady) {
      alert("Please configure Firebase connection using the gear icon top-right.");
      return;
    }
    const code = generateRoomCode();
    await createRoomOnFirebase(code);
  });

  // Confirm Join Room
  btnConfirmJoin.addEventListener("click", async () => {
    if (!verifyName()) return;
    if (!isFirebaseReady) {
      alert("Please configure Firebase connection.");
      return;
    }
    const codeInput = document.getElementById("room-code-input").value.trim().toUpperCase();
    if (codeInput.length !== 6) {
      alert("Please enter a valid 6-character room code.");
      return;
    }
    await joinRoomOnFirebase(codeInput);
  });

  // Leave Lobby
  document.getElementById("btn-leave-lobby").addEventListener("click", () => {
    if (isOfflineMode) {
      exitOfflineMode();
    } else {
      leaveCurrentRoom();
    }
  });

  // Spectator Toggle
  document.getElementById("lobby-spectator-toggle").addEventListener("change", (e) => {
    isSpectator = e.target.checked;
    updateSpectatorStatus(isSpectator);
  });

  // Start Game Button
  document.getElementById("btn-start-game").addEventListener("click", () => {
    if (isOfflineMode) {
      startOfflineGame();
    } else {
      startGame();
    }
  });

  // Hint input listener (real-time validation)
  const hintInput = document.getElementById("hint-input");
  hintInput.addEventListener("input", handleHintInputChange);

  // Send Hint
  document.getElementById("btn-hint-send").addEventListener("click", sendHint);

  // Pass Round
  document.getElementById("btn-hint-pass").addEventListener("click", passHintRound);

  // Guess submission
  document.getElementById("btn-guess-submit").addEventListener("click", submitGuess);
  document.getElementById("guess-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") submitGuess();
  });

  // Reaction Buttons (Spectators & Guessers)
  const reactionPanel = document.getElementById("reaction-panel");
  reactionPanel.addEventListener("click", (e) => {
    const btn = e.target.closest(".reaction-btn");
    if (!btn) return;
    const emoji = btn.dataset.emoji;
    triggerReaction(emoji);
  });

  // Vote buttons
  document.getElementById("btn-vote-valid").addEventListener("click", () => submitConstraintVote("valid"));
  document.getElementById("btn-vote-invalid").addEventListener("click", () => submitConstraintVote("invalid"));

  // Next Round (Host only)
  document.getElementById("btn-next-round").addEventListener("click", () => {
    if (isOfflineMode) {
      advanceOfflineNextRound();
    } else {
      advanceToNextRound();
    }
  });

  // New Game (Results / Game Over)
  document.getElementById("btn-new-game").addEventListener("click", () => {
    if (isOfflineMode) {
      exitOfflineMode();
    } else {
      leaveCurrentRoom();
    }
  });
  
  // Custom Word upload
  const fileInput = document.getElementById("custom-word-file");
  fileInput.addEventListener("change", handleCustomWordUpload);

  // Share score card
  document.getElementById("btn-share-scorecard").addEventListener("click", () => {
    if (isOfflineMode) {
      shareOfflineScoreCard();
    } else {
      shareScoreCard();
    }
  });

  // Play Local Button
  document.getElementById("btn-play-local").addEventListener("click", startLocalMode);

  // Local Setup Screen Events
  document.getElementById("btn-local-back-home").addEventListener("click", exitLocalMode);
  document.getElementById("btn-local-start").addEventListener("click", startLocalGame);

  // Local Handoff
  document.getElementById("btn-local-i-have-device").addEventListener("click", showLocalPeek);

  // Local Peek → Charades
  document.getElementById("btn-local-ready-hide").addEventListener("click", showLocalCharades);

  // Charades buttons — large tap targets
  document.getElementById("btn-local-skip").addEventListener("click", localSkip);
  document.getElementById("btn-local-got-it").addEventListener("click", localGotIt);

  // Local Round Result
  document.getElementById("btn-local-next-round").addEventListener("click", localNextRound);

  // Local Game Over
  document.getElementById("btn-local-play-again").addEventListener("click", localPlayAgain);
  document.getElementById("btn-local-home").addEventListener("click", exitLocalMode);

  // Offline Add Player Button
  document.getElementById("btn-offline-add-player").addEventListener("click", addOfflinePlayer);
  document.getElementById("offline-player-name-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") addOfflinePlayer();
  });

  // Offline Reveal Confirm Button
  document.getElementById("btn-offline-reveal-confirm").addEventListener("click", showOfflineHinting);

  // Offline Scoring controls
  document.getElementById("btn-offline-violation").addEventListener("click", recordOfflineViolation);
  document.getElementById("btn-offline-pass").addEventListener("click", () => endOfflineRound(null));
}

function verifyName() {
  if (isOfflineMode) return true;
  if (!myName) {
    alert("Please enter a nickname first.");
    document.getElementById("player-name").focus();
    return false;
  }
  if (!myUid) {
    alert("Firebase authentication in progress or failed. Please wait a moment or check your browser console (F12) for errors.");
    return false;
  }
  return true;
}

function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ"; // No 'O' or 'I' or '1' or '0' for readability
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// --- Firebase Operations: Create, Join, Leave ---
async function createRoomOnFirebase(code) {
  roomCode = code;
  isHost = true;
  isSpectator = false;
  
  // Setup room default state
  const roomData = {
    status: "lobby",
    hostId: myUid,
    round: 1,
    maxRounds: 5,
    roundDuration: 30,
    categories: Object.keys(CATEGORIES),
    players: {
      [myUid]: {
        name: myName,
        isHost: true,
        role: "player",
        score: 0,
        lastActive: Date.now()
      }
    }
  };
  
  try {
    await set(ref(db, `rooms/${code}`), roomData);
    subscribeToRoom(code);
  } catch (err) {
    console.error("Error creating room:", err);
    alert("Failed to create room on Firebase. Details: " + err.message + "\n\nMake sure your Realtime Database Security Rules are set to writeable.");
  }
}

async function joinRoomOnFirebase(code) {
  try {
    const snap = await get(ref(db, `rooms/${code}`));
    if (!snap.exists()) {
      alert(`Room ${code} does not exist.`);
      return;
    }
    
    roomCode = code;
    isHost = false;
    isSpectator = false;
    
    // Add player to room
    const playerRef = ref(db, `rooms/${code}/players/${myUid}`);
    await set(playerRef, {
      name: myName,
      isHost: false,
      role: "player",
      score: 0,
      lastActive: Date.now()
    });
    
    subscribeToRoom(code);
  } catch (err) {
    console.error("Error joining room:", err);
    alert("Failed to join room. Details: " + err.message);
  }
}

function subscribeToRoom(code) {
  // Clean up existing listeners
  unsubscribeListeners();
  
  const roomRef = ref(db, `rooms/${code}`);
  
  // Enable onDisconnect clean up so offline players are pruned from Firebase
  onDisconnect(ref(db, `rooms/${code}/players/${myUid}`)).remove();
  
  const unsub = onValue(roomRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      alert("Room was closed or deleted.");
      leaveCurrentRoom();
      return;
    }
    currentRoomData = data;
    isHost = (data.hostId === myUid);
    
    // Safety sync: check if I'm listed in players
    if (data.players && data.players[myUid]) {
      isSpectator = (data.players[myUid].role === "spectator");
    } else {
      // Re-join if disconnected or deleted
      set(ref(db, `rooms/${code}/players/${myUid}`), {
        name: myName,
        isHost: isHost,
        role: isSpectator ? "spectator" : "player",
        score: 0,
        lastActive: Date.now()
      });
    }

    renderGameScreen(data);
  });
  
  dbListeners.push(unsub);
  
  // Add listeners for floating reaction triggers
  const reactionsRef = ref(db, `rooms/${code}/reactions`);
  const reactionsUnsub = onValue(reactionsRef, (snap) => {
    const reactions = snap.val();
    if (reactions) {
      // Find new reactions
      Object.keys(reactions).forEach(key => {
        const item = reactions[key];
        // Only trigger if reaction is recent (less than 2s old) and not triggered yet
        if (Date.now() - item.timestamp < 2000 && item.senderId !== myUid) {
          triggerFloatingEmoji(item.emoji);
        }
      });
    }
  });
  dbListeners.push(reactionsUnsub);
}

function unsubscribeListeners() {
  dbListeners.forEach(off => off());
  dbListeners = [];
}

async function leaveCurrentRoom() {
  unsubscribeListeners();
  if (roomCode) {
    try {
      // If I'm the host, we could delete the room. But to allow remaining players to stay, we can rotate host, or delete if empty.
      const playersRef = ref(db, `rooms/${roomCode}/players`);
      const snap = await get(playersRef);
      if (snap.exists()) {
        const players = snap.val();
        delete players[myUid];
        
        if (Object.keys(players).length === 0) {
          // Room empty, delete room
          await remove(ref(db, `rooms/${roomCode}`));
        } else {
          // Room not empty
          await remove(ref(db, `rooms/${roomCode}/players/${myUid}`));
          if (isHost) {
            // Pick next player as host
            const nextHostId = Object.keys(players)[0];
            await update(ref(db, `rooms/${roomCode}`), { hostId: nextHostId });
            await update(ref(db, `rooms/${roomCode}/players/${nextHostId}`), { isHost: true });
          }
        }
      }
    } catch (e) {
      console.error("Error leaving room:", e);
    }
  }
  
  roomCode = "";
  isHost = false;
  isSpectator = false;
  currentRoomData = null;
  roleRevealTimeoutActive = false;
  
  if (timerInterval) clearInterval(timerInterval);
  confettiSystem.stop();
  
  // Reset UI elements
  document.getElementById("btn-create-lobby").style.display = "inline-flex";
  document.getElementById("btn-show-join").style.display = "inline-flex";
  document.getElementById("join-code-container").style.display = "none";
  document.getElementById("join-action-container").style.display = "none";
  
  showScreen("home");
}

async function updateSpectatorStatus(spectator) {
  if (!roomCode) return;
  const role = spectator ? "spectator" : "player";
  await update(ref(db, `rooms/${roomCode}/players/${myUid}`), { role: role });
}

// --- Host Setting Changes (Category Chip Selector) ---
function buildCategoryChips(containerId, onChangeFn) {
  const grid = document.getElementById(containerId);
  if (!grid || grid.children.length > 0) return;
  Object.keys(CATEGORIES).forEach(cat => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cat-chip selected";
    btn.textContent = cat;
    btn.dataset.category = cat;
    btn.addEventListener("click", () => {
      const selectedCount = grid.querySelectorAll(".cat-chip.selected").length;
      if (btn.classList.contains("selected") && selectedCount <= 1) {
        alert("Select at least one category!");
        return;
      }
      btn.classList.toggle("selected");
      if (onChangeFn) onChangeFn();
    });
    grid.appendChild(btn);
  });
}

function getSelectedChips(containerId) {
  return [...document.querySelectorAll(`#${containerId} .cat-chip.selected`)]
    .map(b => b.dataset.category);
}

function bindHostLobbyControls() {
  const selectRounds = document.getElementById("select-rounds");
  const selectTimer = document.getElementById("select-timer");
  
  buildCategoryChips("lobby-categories-list", syncHostSettings);

  // Bind dropdowns
  selectRounds.onchange = syncHostSettings;
  selectTimer.onchange = syncHostSettings;
}

async function syncHostSettings() {
  if (!isHost || !roomCode) return;
  
  const maxRounds = parseInt(document.getElementById("select-rounds").value);
  const roundDuration = parseInt(document.getElementById("select-timer").value);
  const selectedCats = getSelectedChips("lobby-categories-list");

  await update(ref(db, `rooms/${roomCode}`), {
    maxRounds: maxRounds,
    roundDuration: roundDuration,
    categories: selectedCats.length > 0 ? selectedCats : Object.keys(CATEGORIES)
  });
}

function handleCustomWordUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    const text = event.target.result;
    const words = parseCustomWords(text);
    if (words.length < 5) {
      alert("Invalid custom word pack. Must have at least 5 words, one per line.");
      return;
    }
    
    document.getElementById("custom-word-label").innerHTML = `Custom Word Pack <span class="word-count-badge">${words.length} words</span>`;
    
    // Store in Firebase
    if (roomCode) {
      await update(ref(db, `rooms/${roomCode}`), { customWords: words });
    }
  };
  reader.readAsText(file);
}

// --- Screen Renderer Switchboard ---
function renderGameScreen(room) {
  const currentStatus = room.status;
  
  // Display Room Code and Players count
  document.getElementById("lobby-code-display").innerText = roomCode;
  
  if (currentStatus === "lobby") {
    renderLobby(room);
  } else if (currentStatus === "roleReveal") {
    renderRoleReveal(room);
  } else if (currentStatus === "hinting") {
    renderHinting(room);
  } else if (currentStatus === "guessing") {
    renderGuessing(room);
  } else if (currentStatus === "roundEnd") {
    renderRoundEnd(room);
  } else if (currentStatus === "gameOver") {
    renderGameOver(room);
  }
}

// 1. Lobby Screen Rendering
function renderLobby(room) {
  showScreen("lobby");
  
  // Render players
  const playerListDiv = document.getElementById("lobby-player-list");
  playerListDiv.innerHTML = "";
  
  let totalActivePlayers = 0;
  
  const pList = room.players || {};
  Object.keys(pList).forEach(uid => {
    const p = pList[uid];
    const isMe = (uid === myUid);
    
    const div = document.createElement("div");
    div.className = `player-item ${p.isHost ? 'host' : ''} ${isMe ? 'me' : ''} ${p.role === 'spectator' ? 'spectator' : ''}`;
    
    let roleText = "";
    if (p.isHost) roleText += "👑 Host ";
    if (p.role === "spectator") {
      roleText += "👁️ Spectator";
    } else {
      roleText += "👤 Player";
      totalActivePlayers++;
    }
    
    div.innerHTML = `
      <div style="flex: 1; font-weight: bold;">${p.name} ${isMe ? '(You)' : ''}</div>
      <div style="font-size: 0.75rem; color: var(--text-muted);">${roleText}</div>
    `;
    playerListDiv.appendChild(div);
  });
  
  document.getElementById("player-count").innerText = Object.keys(pList).length;
  
  // Render lobby-code click to copy
  document.getElementById("lobby-code-display").onclick = () => {
    navigator.clipboard.writeText(roomCode);
    alert("Room code copied to clipboard!");
  };

  // Host UI Adjustments
  const hostPanel = document.getElementById("lobby-host-controls");
  const btnStart = document.getElementById("btn-start-game");
  const waitMsg = document.getElementById("lobby-wait-msg");
  
  if (isHost) {
    hostPanel.style.display = "flex";
    bindHostLobbyControls();
    
    // Can start if >= 2 active players
    btnStart.style.display = "inline-flex";
    waitMsg.style.display = "none";
    
    if (totalActivePlayers >= 2) {
      btnStart.disabled = false;
      btnStart.innerText = "🚀 Start Game";
    } else {
      btnStart.disabled = true;
      btnStart.innerText = "Start Game (Need ≥ 2 players)";
    }
    
    // Sync dropdown values with firebase data (if modified by host)
    document.getElementById("select-rounds").value = room.maxRounds || 5;
    document.getElementById("select-timer").value = room.roundDuration || 30;
  } else {
    hostPanel.style.display = "none";
    btnStart.style.display = "none";
    waitMsg.style.display = "block";
  }
}

// 2. Role Reveal Screen Rendering
function renderRoleReveal(room) {
  showScreen("role-reveal");
  
  const revealTitle = document.getElementById("role-reveal-title");
  const revealIcon = document.getElementById("role-reveal-icon");
  const revealDesc = document.getElementById("role-reveal-desc");
  
  const isMeGiver = (room.hintGiverId === myUid);
  
  if (isSpectator) {
    revealTitle.className = "role-reveal-title spectator";
    revealTitle.innerText = "SPECTATOR";
    revealIcon.innerText = "👁️";
    revealDesc.innerText = `You are watching the game. The Hint-Giver is ${room.hintGiverName}.`;
  } else if (isMeGiver) {
    revealTitle.className = "role-reveal-title hint-giver";
    revealTitle.innerText = "HINT-GIVER";
    revealIcon.innerText = "🎯";
    revealDesc.innerText = `You must describe the target words while obeying the crazy constraints!`;
  } else {
    revealTitle.className = "role-reveal-title guesser";
    revealTitle.innerText = "GUESSER";
    revealIcon.innerText = "🧠";
    revealDesc.innerText = `Listen carefully to ${room.hintGiverName}'s constraints and guess the target word first!`;
  }
  
  // Host handles role reveal timing (3s) to avoid client race conditions
  if (isHost && !roleRevealTimeoutActive) {
    roleRevealTimeoutActive = true;
    
    // Sync the role reveal countdown timer to Firebase for other players to see
    set(ref(db, `rooms/${roomCode}/timer`), {
      duration: 3,
      startedAt: Date.now()
    });
    
    setTimeout(async () => {
      roleRevealTimeoutActive = false;
      // Double check room still exists and status is roleReveal
      const snap = await get(ref(db, `rooms/${roomCode}/status`));
      if (snap.exists() && snap.val() === "roleReveal") {
        update(ref(db, `rooms/${roomCode}`), {
          status: "hinting",
          timer: {
            duration: room.roundDuration || 30,
            startedAt: Date.now()
          },
          hintsRemaining: 3,
          currentHint: "",
          hintHistory: null,
          guesses: null,
          votes: null
        });
      }
    }, 3000);
  }
}

// 3. Hint-Giver Screen / Hint Submission (Or Waiting state for Guessers)
function renderHinting(room) {
  const isMeGiver = (room.hintGiverId === myUid);
  
  // Clean values from round round card displays
  document.querySelectorAll(".current-round-number").forEach(el => el.innerText = room.round);
  document.querySelectorAll(".max-rounds-number").forEach(el => el.innerText = room.maxRounds);
  
  if (isMeGiver) {
    showScreen("hinting");
    
    // Target & Category
    document.getElementById("hinting-category").innerText = room.currentCategory;
    document.getElementById("hinting-word").innerText = room.targetWord;
    
    // Constraint details
    const c = room.currentConstraint;
    document.getElementById("hinting-constraint-icon").innerText = c.icon;
    document.getElementById("hinting-constraint-label").innerText = c.label;
    document.getElementById("hinting-constraint-desc").innerText = c.description;
    
    // Hints History feed
    renderHintsList(room.hintHistory, "hinting-feed");
    
    // Set hints remaining count
    const rem = room.hintsRemaining || 3;
    document.getElementById("hinting-count-badge").innerText = 3 - rem;
    
    // Reset typing inputs
    const hintInput = document.getElementById("hint-input");
    
    // Real-time validate
    handleHintInputChange();
    
    // Synced Timer
    startClientTimer(room.timer, "hinting-timer-bar", () => {
      if (isHost) {
        // If Hint Giver times out, they skipped their turn or pass
        handleHintGiverTimeout();
      }
    });
    
  } else {
    // Guesser/Spectator wait screen during Hint-Giver typing
    showScreen("guessing");
    
    document.getElementById("guessing-category").innerText = room.currentCategory;
    
    // Constraint details
    const c = room.currentConstraint;
    document.getElementById("guessing-constraint-icon").innerText = c.icon;
    document.getElementById("guessing-constraint-label").innerText = c.label;
    document.getElementById("guessing-constraint-desc").innerText = c.description;
    
    // Hints feed
    renderHintsList(room.hintHistory, "guessing-feed");
    
    // Wait message/input hiding
    document.getElementById("guesser-input-panel").style.display = "none";
    document.getElementById("guesser-submitted-panel").style.display = "none";
    document.getElementById("guess-giver-name").innerText = `${room.hintGiverName} (Is typing...)`;
    
    if (isSpectator) {
      document.getElementById("spectator-indicator-panel").style.display = "block";
      document.getElementById("spectator-target-word").innerText = room.targetWord;
    } else {
      document.getElementById("spectator-indicator-panel").style.display = "none";
    }

    renderGuessesStream(room.guesses, false);
    
    // Synced Timer
    startClientTimer(room.timer, "guessing-timer-bar");
  }
}

// 4. Guessing Screen (Both Hint-Giver and Guessers)
function renderGuessing(room) {
  const isMeGiver = (room.hintGiverId === myUid);
  
  document.querySelectorAll(".current-round-number").forEach(el => el.innerText = room.round);
  document.querySelectorAll(".max-rounds-number").forEach(el => el.innerText = room.maxRounds);
  
  if (isMeGiver) {
    // Hint-giver waits for guessers to submit answers
    showScreen("hinting");
    
    document.getElementById("hinting-category").innerText = room.currentCategory;
    document.getElementById("hinting-word").innerText = room.targetWord;
    
    const c = room.currentConstraint;
    document.getElementById("hinting-constraint-icon").innerText = c.icon;
    document.getElementById("hinting-constraint-label").innerText = c.label;
    document.getElementById("hinting-constraint-desc").innerText = c.description;
    
    renderHintsList(room.hintHistory, "hinting-feed");
    
    const rem = room.hintsRemaining || 3;
    document.getElementById("hinting-count-badge").innerText = 3 - rem;
    
    // Disable inputs while guessers are guessing
    document.getElementById("hint-input").disabled = true;
    document.getElementById("btn-hint-send").disabled = true;
    document.getElementById("btn-hint-pass").disabled = true;
    document.getElementById("hint-validation-feedback").innerText = "Waiting for Guesser submissions...";
    document.getElementById("hint-validation-feedback").className = "validation-feedback valid";
    
    // Synced Timer
    startClientTimer(room.timer, "hinting-timer-bar", () => {
      if (isHost) {
        handleGuessingTimeout();
      }
    });
    
  } else {
    // Guessers are guessing!
    showScreen("guessing");
    
    document.getElementById("guessing-category").innerText = room.currentCategory;
    
    const c = room.currentConstraint;
    document.getElementById("guessing-constraint-icon").innerText = c.icon;
    document.getElementById("guessing-constraint-label").innerText = c.label;
    document.getElementById("guessing-constraint-desc").innerText = c.description;
    
    renderHintsList(room.hintHistory, "guessing-feed");
    
    document.getElementById("guess-giver-name").innerText = room.hintGiverName;
    
    // Verify if I have already guessed
    if (isSpectator) {
      document.getElementById("guesser-input-panel").style.display = "none";
      document.getElementById("guesser-submitted-panel").style.display = "none";
      document.getElementById("spectator-indicator-panel").style.display = "block";
      document.getElementById("spectator-target-word").innerText = room.targetWord;
    } else {
      document.getElementById("spectator-indicator-panel").style.display = "none";
      
      const myGuess = (room.guesses && room.guesses[myUid]);
      if (myGuess) {
        document.getElementById("guesser-input-panel").style.display = "none";
        document.getElementById("guesser-submitted-panel").style.display = "block";
      } else {
        document.getElementById("guesser-input-panel").style.display = "block";
        document.getElementById("guesser-submitted-panel").style.display = "none";
      }
    }
    
    // Show stream of other guessers (blurred for guessers, clear for spectators)
    renderGuessesStream(room.guesses, isSpectator);
    
    // Synced Timer
    startClientTimer(room.timer, "guessing-timer-bar", () => {
      if (isHost) {
        handleGuessingTimeout();
      }
    });
  }
}

// 5. Round End results screen
function renderRoundEnd(room) {
  showScreen("results");
  
  // Target Reveal
  document.getElementById("results-target-word-val").innerText = room.targetWord;
  
  // Show Voting box for Guessers & Spectators (Not Hint Giver)
  const isMeGiver = (room.hintGiverId === myUid);
  const votingPanel = document.getElementById("voting-panel");
  const votingStatusPanel = document.getElementById("voting-status-panel");
  
  // Find last hint text
  let lastHint = "";
  if (room.hintHistory && room.hintHistory.length > 0) {
    lastHint = room.hintHistory[room.hintHistory.length - 1].text;
  }
  
  // Verify if voting is completed or active
  if (!isMeGiver && lastHint && (!room.votes || !room.votes[myUid])) {
    votingPanel.style.display = "block";
    document.getElementById("voting-hint-text").innerText = `"${lastHint}"`;
  } else {
    votingPanel.style.display = "none";
  }
  
  // Show Live votes counts
  if (room.votes) {
    votingStatusPanel.style.display = "block";
    let val = 0, inv = 0;
    Object.values(room.votes).forEach(v => {
      if (v === "valid") val++;
      if (v === "invalid") inv++;
    });
    document.getElementById("voting-status-text").innerText = `Valid Votes: 👍 ${val} | Violation Votes: 👎 ${inv}`;
    
    // Trigger invalidity penalty once on Host if majority vote invalid
    if (isHost && !room.votePenaltyChecked && (inv > val)) {
      applyInvalidHintPenalty();
    }
  } else {
    votingStatusPanel.style.display = "none";
  }
  
  // Score changes breakdown
  const breakdownDiv = document.getElementById("results-breakdown-list");
  breakdownDiv.innerHTML = "";
  
  const scChanges = room.roundScores || {};
  Object.keys(scChanges).forEach(uid => {
    const ch = scChanges[uid];
    const pName = room.players[uid] ? room.players[uid].name : "Player";
    
    const row = document.createElement("div");
    row.className = "score-row";
    row.innerHTML = `
      <span>${pName}</span>
      <span class="score-change ${ch >= 0 ? 'positive' : 'negative'}">${ch >= 0 ? '+' : ''}${ch} pts</span>
    `;
    breakdownDiv.appendChild(row);
  });
  
  if (Object.keys(scChanges).length === 0) {
    breakdownDiv.innerHTML = "<div class='empty-hints'>No score adjustments this round.</div>";
  }
  
  // Leaderboard rendering
  renderLeaderboard(room.players, "results-leaderboard");

  // Host Next Round button control
  const btnNext = document.getElementById("btn-next-round");
  const waitMsg = document.getElementById("results-wait-msg");
  
  if (isHost) {
    btnNext.style.display = "inline-flex";
    btnNext.innerText = (room.round >= room.maxRounds) ? "🏆 Finish Game" : "Next Round →";
    waitMsg.style.display = "none";
  } else {
    btnNext.style.display = "none";
    waitMsg.style.display = "block";
    waitMsg.innerText = (room.round >= room.maxRounds) ? "Waiting for host to reveal final results..." : "Waiting for host to load next round...";
  }
}

// 6. Game Over Screen
function renderGameOver(room) {
  showScreen("gameOver");
  
  // Confetti on GameOver
  confettiSystem.start();
  
  // Final standings
  renderLeaderboard(room.players, "gameover-leaderboard");
  
  // Game recap feed
  const historyDiv = document.getElementById("gameover-history-list");
  historyDiv.innerHTML = "";
  
  const hist = room.gameHistory || [];
  hist.forEach(h => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div>Round ${h.round} target: <span class="history-word">${h.targetWord}</span> (${h.category})</div>
      <div class="history-hint">Hint by ${h.giver}: "${h.hintText}"</div>
      <div class="history-votes">Constraint: ${h.constraintLabel} | Giver Score: ${h.pointsGained} pts</div>
    `;
    historyDiv.appendChild(item);
  });
  
  if (hist.length === 0) {
    historyDiv.innerHTML = "<div class='empty-hints'>No history recap available.</div>";
  }

  // Host play again button controls
  const btnPlayAgain = document.getElementById("btn-play-again");
  const waitMsg = document.getElementById("gameover-wait-msg");
  
  if (isHost) {
    btnPlayAgain.style.display = "inline-flex";
    waitMsg.style.display = "none";
  } else {
    btnPlayAgain.style.display = "none";
    waitMsg.style.display = "block";
  }
  
  // Bind Play Again
  btnPlayAgain.onclick = () => {
    if (isOfflineMode) {
      resetOfflineGame();
    } else {
      resetGameRoom();
    }
  };
}

// --- UI Sub-renders ---
function renderHintsList(hints, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  
  if (!hints || hints.length === 0) {
    container.innerHTML = `<div class="empty-hints">No hints sent yet.</div>`;
    return;
  }
  
  hints.forEach((h, index) => {
    const div = document.createElement("div");
    div.className = `hint-bubble ${h.valid === false ? 'invalid' : ''}`;
    
    div.innerHTML = `
      <div class="hint-text">"${h.text}"</div>
      <div class="hint-meta">
        <span>Hint #${index + 1}</span>
        ${h.valid === false ? '<span class="invalid-badge">⚠️ Banned hint</span>' : ''}
      </div>
    `;
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

function renderGuessesStream(guesses, unblurred) {
  const stream = document.getElementById("guesses-stream");
  stream.innerHTML = "";
  
  if (!guesses) {
    stream.innerHTML = `<div class="empty-hints" style="font-size:0.8rem;">No guesses submitted yet.</div>`;
    return;
  }
  
  Object.keys(guesses).forEach(uid => {
    const g = guesses[uid];
    
    const row = document.createElement("div");
    row.className = "guess-row";
    
    // Blur logic to prevent cheating
    const showPlain = unblurred || (uid === myUid);
    const textClass = showPlain ? "guess-text" : "guess-text blurred";
    const textContent = showPlain ? g.text : "••••••••";
    
    row.innerHTML = `
      <span class="guess-user">${g.name}</span>
      <span class="${textClass}">${textContent}</span>
    `;
    stream.appendChild(row);
  });
  stream.scrollTop = stream.scrollHeight;
}

function renderLeaderboard(players, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  
  // Sort players by score descending
  const sorted = Object.keys(players)
    .filter(uid => players[uid].role !== "spectator")
    .map(uid => ({ uid: uid, ...players[uid] }))
    .sort((a, b) => (b.score || 0) - (a.score || 0));
    
  sorted.forEach((p, idx) => {
    const isWinner = (idx === 0 && p.score > 0);
    
    const row = document.createElement("div");
    row.className = `leaderboard-row ${isWinner ? 'winner-row' : ''}`;
    
    let medal = "👤";
    if (idx === 0) medal = "🥇";
    else if (idx === 1) medal = "🥈";
    else if (idx === 2) medal = "🥉";
    
    row.innerHTML = `
      <div class="leaderboard-player-info">
        <span class="leaderboard-avatar">${medal}</span>
        <span style="font-weight: 700;">${p.name} ${p.uid === myUid ? '(You)' : ''}</span>
      </div>
      <div class="leaderboard-score">${p.score || 0} pts</div>
    `;
    container.appendChild(row);
  });
}

// --- Dynamic Real-time Client Timer ---
function startClientTimer(timerData, barId, onTimeoutCallback) {
  if (timerInterval) clearInterval(timerInterval);
  if (!timerData) return;
  
  const bar = document.getElementById(barId);
  if (!bar) return;
  
  lastTimerWarn = false;
  
  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - timerData.startedAt) / 1000;
    const remaining = Math.max(0, timerData.duration - elapsed);
    const percent = (remaining / timerData.duration) * 100;
    
    bar.style.width = `${percent}%`;
    
    // Audio/visual pulse warning when remaining time < 5s
    if (remaining <= 5 && !lastTimerWarn) {
      lastTimerWarn = true;
      bar.classList.add("warning");
    } else if (remaining > 5) {
      bar.classList.remove("warning");
    }
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
      bar.style.width = "0%";
      bar.classList.remove("warning");
      
      if (onTimeoutCallback) {
        onTimeoutCallback();
      }
    }
  }, 100);
}

// --- Constraint Checker real-time listeners ---
function handleHintInputChange() {
  const input = document.getElementById("hint-input");
  const sendBtn = document.getElementById("btn-hint-send");
  const feedback = document.getElementById("hint-validation-feedback");
  const charCounter = document.getElementById("hint-input-count");
  
  const text = input.value;
  charCounter.innerText = `${text.length} characters`;
  
  if (text.trim() === "") {
    sendBtn.disabled = true;
    feedback.innerText = "Hint is empty";
    feedback.className = "validation-feedback invalid";
    return;
  }
  
  const activeConstraint = currentRoomData?.currentConstraint;
  if (!activeConstraint) {
    sendBtn.disabled = false;
    feedback.innerText = "✓ Valid Hint";
    feedback.className = "validation-feedback valid";
    return;
  }
  
  const res = validateHint(text, activeConstraint.id);
  if (res.valid) {
    sendBtn.disabled = false;
    feedback.innerText = "✓ Obeying Constraint!";
    feedback.className = "validation-feedback valid";
  } else {
    sendBtn.disabled = true;
    feedback.innerText = `✗ ${res.errorMsg}`;
    feedback.className = "validation-feedback invalid";
  }
}

// --- Game Logic Operations (Roles & Submissions) ---

// 1. Hint Giver sends hint
async function sendHint() {
  const input = document.getElementById("hint-input");
  const text = input.value.trim();
  if (!text || !roomCode) return;
  
  const activeConstraint = currentRoomData.currentConstraint;
  const validation = validateHint(text, activeConstraint.id);
  
  if (!validation.valid) {
    alert(validation.errorMsg);
    return;
  }
  
  // Add hint to history list
  const nextRem = (currentRoomData.hintsRemaining || 3) - 1;
  const history = currentRoomData.hintHistory || [];
  history.push({
    text: text,
    valid: true,
    timestamp: Date.now()
  });
  
  input.value = "";
  document.getElementById("btn-hint-send").disabled = true;
  
  // Update state: shift to guessing state and refresh guessers timer (30s)
  await update(ref(db, `rooms/${roomCode}`), {
    status: "guessing",
    currentHint: text,
    hintsRemaining: nextRem,
    hintHistory: history,
    timer: {
      duration: currentRoomData.roundDuration || 30,
      startedAt: Date.now()
    }
  });
}

// 2. Hint Giver skips / passes
async function passHintRound() {
  if (!roomCode || !currentRoomData) return;
  if (!confirm("Are you sure you want to pass? This costs the Hint-Giver -50 points!")) return;
  
  const giverId = currentRoomData.hintGiverId;
  const roundScores = {
    [giverId]: -50
  };
  
  // Deduct 50 pts
  await runTransaction(ref(db, `rooms/${roomCode}/players/${giverId}/score`), (current) => {
    return (current || 0) - 50;
  });
  
  // End round
  await update(ref(db, `rooms/${roomCode}`), {
    status: "roundEnd",
    roundScores: roundScores,
    winnerId: "none",
    timer: null
  });
}

// 3. Guesser submits guess
async function submitGuess() {
  const input = document.getElementById("guess-input");
  const text = input.value.trim();
  if (!text || !roomCode || isSpectator) return;
  
  input.value = "";
  document.getElementById("btn-guess-submit").disabled = true;
  
  const myGuessData = {
    name: myName,
    text: text,
    timestamp: Date.now()
  };
  
  // Push guess to firebase
  await set(ref(db, `rooms/${roomCode}/guesses/${myUid}`), myGuessData);
  
  // Verify guess locally. If correct, client registers it in transaction
  const target = currentRoomData.targetWord.toLowerCase().trim();
  const guess = text.toLowerCase().trim();
  
  if (target === guess) {
    await handleCorrectGuess();
  }
}

// 4. Correct Guess triggers scoring and results
async function handleCorrectGuess() {
  // Let the host handle scoring transaction to avoid racing updates
  const giverId = currentRoomData.hintGiverId;
  const remHints = currentRoomData.hintsRemaining || 0; // Rem hints: 2 = 1st hint used, 1 = 2nd used, 0 = 3rd used
  
  let guesserPoints = 50;
  if (remHints === 2) guesserPoints = 100;
  else if (remHints === 1) guesserPoints = 75;
  
  const giverPoints = 60;
  
  const roundScores = {
    [myUid]: guesserPoints,
    [giverId]: giverPoints
  };
  
  // Award points
  await runTransaction(ref(db, `rooms/${roomCode}/players/${myUid}/score`), (cur) => (cur || 0) + guesserPoints);
  await runTransaction(ref(db, `rooms/${roomCode}/players/${giverId}/score`), (cur) => (cur || 0) + giverPoints);
  
  // Save game history recap log
  const gameHistory = currentRoomData.gameHistory || [];
  let lastHint = "";
  if (currentRoomData.hintHistory && currentRoomData.hintHistory.length > 0) {
    lastHint = currentRoomData.hintHistory[currentRoomData.hintHistory.length - 1].text;
  }
  
  gameHistory.push({
    round: currentRoomData.round,
    targetWord: currentRoomData.targetWord,
    category: currentRoomData.currentCategory,
    giver: currentRoomData.hintGiverName,
    hintText: lastHint,
    constraintLabel: currentRoomData.currentConstraint.label,
    pointsGained: giverPoints
  });
  
  // Transition to results screen
  await update(ref(db, `rooms/${roomCode}`), {
    status: "roundEnd",
    roundScores: roundScores,
    winnerId: myUid,
    winnerName: myName,
    gameHistory: gameHistory,
    timer: null
  });
  
  confettiSystem.start();
}

// 5. Synced Host-driven State timeouts
async function handleHintGiverTimeout() {
  // Giver failed to write hint in time, end round, deduct 30 points
  const giverId = currentRoomData.hintGiverId;
  const roundScores = {
    [giverId]: -30
  };
  await runTransaction(ref(db, `rooms/${roomCode}/players/${giverId}/score`), (cur) => (cur || 0) - 30);
  
  await update(ref(db, `rooms/${roomCode}`), {
    status: "roundEnd",
    roundScores: roundScores,
    winnerId: "none",
    timer: null
  });
}

async function handleGuessingTimeout() {
  const rem = currentRoomData.hintsRemaining || 0;
  if (rem > 0) {
    // Return to hinting phase to let giver enter another hint
    await update(ref(db, `rooms/${roomCode}`), {
      status: "hinting",
      timer: {
        duration: currentRoomData.roundDuration || 30,
        startedAt: Date.now()
      }
    });
  } else {
    // No hints left! End round, penalty to giver (-30 pts)
    const giverId = currentRoomData.hintGiverId;
    const roundScores = {
      [giverId]: -30
    };
    await runTransaction(ref(db, `rooms/${roomCode}/players/${giverId}/score`), (cur) => (cur || 0) - 30);
    
    await update(ref(db, `rooms/${roomCode}`), {
      status: "roundEnd",
      roundScores: roundScores,
      winnerId: "none",
      timer: null
    });
  }
}

// --- Pro Feature 1: Constraint Verification Voting ---
async function submitConstraintVote(voteType) {
  if (!roomCode || isSpectator) return;
  await update(ref(db, `rooms/${roomCode}/votes`), {
    [myUid]: voteType
  });
}

async function applyInvalidHintPenalty() {
  // Majority voted hint is invalid. Penalty -20 to Giver
  const giverId = currentRoomData.hintGiverId;
  
  await runTransaction(ref(db, `rooms/${roomCode}/players/${giverId}/score`), (cur) => (cur || 0) - 20);
  
  // Update round Scores list to reflect penalty
  const roundScores = currentRoomData.roundScores || {};
  roundScores[giverId] = (roundScores[giverId] || 0) - 20;
  
  // Set flag so penalty applies only once
  await update(ref(db, `rooms/${roomCode}`), {
    roundScores: roundScores,
    votePenaltyChecked: true
  });
  
  alert("Hint-Giver was penalized -20 points due to constraint violation votes!");
}

// --- Pro Feature 2: Floating Emoji reactions ---
async function triggerReaction(emoji) {
  if (!roomCode) return;
  
  // Push reaction to list. Clean up old reactions inside the transaction is too heavy,
  // we just write a child node with a timestamp.
  const reactionRef = ref(db, `rooms/${roomCode}/reactions`);
  const newRef = push(reactionRef);
  await set(newRef, {
    emoji: emoji,
    timestamp: Date.now(),
    senderId: myUid
  });
  
  // Trigger reaction locally immediately
  triggerFloatingEmoji(emoji);
}

function triggerFloatingEmoji(emoji) {
  const container = document.getElementById("main-container");
  if (!container) return;
  
  const el = document.createElement("div");
  el.className = "floating-emoji";
  el.innerText = emoji;
  
  // Generate random floating drift offsets
  const startX = Math.random() * 100 - 50; // -50px to 50px
  const endX = startX + (Math.random() * 80 - 40); // add drift
  
  el.style.setProperty("--random-x", `${startX}px`);
  el.style.setProperty("--random-x-end", `${endX}px`);
  el.style.left = `calc(50% + ${startX}px)`;
  el.style.bottom = "40px";
  
  container.appendChild(el);
  
  // Clean up element after animation
  setTimeout(() => {
    el.remove();
  }, 1500);
}

// --- Game Progression: Next Round & Resets ---
async function advanceToNextRound() {
  if (!isHost || !roomCode) return;
  
  const nextRound = (currentRoomData.round || 1) + 1;
  const max = currentRoomData.maxRounds || 5;
  
  if (nextRound > max) {
    // Game is complete! Transition to GameOver
    await update(ref(db, `rooms/${roomCode}`), {
      status: "gameOver",
      timer: null
    });
  } else {
    // Proceed to next round: rotate Hint Giver, choose target word & constraint
    confettiSystem.stop();
    await setupNextRound(nextRound);
  }
}

async function setupNextRound(roundNumber) {
  const players = currentRoomData.players || {};
  
  // Select active players (exclude spectators)
  const activeIds = Object.keys(players)
    .filter(uid => players[uid].role !== "spectator");
    
  if (activeIds.length < 2) {
    alert("Not enough active players to proceed!");
    return;
  }
  
  // Deterministic rotation of Hint-Giver
  const randGiverId = activeIds[(roundNumber - 1) % activeIds.length];
  const giverName = players[randGiverId].name;
  
  // Draw random category & word
  const category = getRandomCategory(currentRoomData.categories);
  const word = getRandomWord(category, currentRoomData.customWords, currentRoomData.usedWords || []);
  
  // Add word to used list
  const used = currentRoomData.usedWords || [];
  used.push(word.toLowerCase());
  
  // Draw random constraint
  const randConstraint = CONSTRAINTS[Math.floor(Math.random() * CONSTRAINTS.length)];
  
  await update(ref(db, `rooms/${roomCode}`), {
    status: "roleReveal",
    round: roundNumber,
    hintGiverId: randGiverId,
    hintGiverName: giverName,
    currentCategory: category,
    targetWord: word,
    currentConstraint: {
      id: randConstraint.id,
      label: randConstraint.label,
      description: randConstraint.description,
      icon: randConstraint.icon
    },
    usedWords: used,
    hintsRemaining: 3,
    currentHint: "",
    hintHistory: null,
    guesses: null,
    roundScores: null,
    votes: null,
    votePenaltyChecked: null,
    reactions: null,
    timer: {
      duration: 3, // Role reveal lasts 3s
      startedAt: Date.now()
    }
  });
}

// Host starts game from Lobby
async function startGame() {
  if (!isHost || !roomCode) return;
  
  const players = currentRoomData.players || {};
  const activeIds = Object.keys(players)
    .filter(uid => players[uid].role !== "spectator");
    
  if (activeIds.length < 2) {
    alert("Cannot start game without at least 2 active players!");
    return;
  }
  
  // Clear any residual game states and setup round 1
  await setupNextRound(1);
}

// Reset Game (Play Again - same room, reset scores)
async function resetGameRoom() {
  if (!isHost || !roomCode) return;
  
  confettiSystem.stop();
  
  const players = currentRoomData.players || {};
  
  // Reset all players scores to 0 in transaction
  const updates = {};
  Object.keys(players).forEach(uid => {
    updates[`players/${uid}/score`] = 0;
  });
  
  updates["round"] = 1;
  updates["gameHistory"] = null;
  updates["usedWords"] = null;
  updates["reactions"] = null;
  
  roleRevealTimeoutActive = false;
  await update(ref(db, `rooms/${roomCode}`), updates);
  await setupNextRound(1);
}

// --- Pro Feature 5: Sharing Score Card ---
function shareScoreCard() {
  if (!currentRoomData) return;
  
  const players = currentRoomData.players || {};
  const sorted = Object.keys(players)
    .filter(uid => players[uid].role !== "spectator")
    .map(uid => ({ name: players[uid].name, score: players[uid].score || 0 }))
    .sort((a, b) => b.score - a.score);
    
  let card = "🏆 THE RESTRICTED SPEAKER SCORECARD 🏆\n\n";
  sorted.forEach((p, idx) => {
    let medal = "👤";
    if (idx === 0) medal = "🥇";
    else if (idx === 1) medal = "🥈";
    else if (idx === 2) medal = "🥉";
    card += `${medal} ${p.name}: ${p.score} pts\n`;
  });
  card += "\nPlay 'The Restricted Speaker' now! 🚫☝️👻❓";
  
  navigator.clipboard.writeText(card);
  alert("Score card copied to clipboard! Share it with friends.");
}

// ==========================================
// --- Offline (Local Pass & Play) Engine ---
// ==========================================

function startOfflineMode() {
  isOfflineMode = true;
  
  // Adjust lobby UI components for local players lists
  document.querySelector(".room-code-panel").style.display = "none";
  document.getElementById("offline-add-player-panel").style.display = "flex";
  document.getElementById("lobby-spectator-toggle").parentElement.style.display = "none";
  
  // Open settings for host options
  document.getElementById("lobby-host-controls").style.display = "flex";
  document.getElementById("btn-start-game").style.display = "inline-flex";
  document.getElementById("btn-start-game").disabled = true;
  document.getElementById("btn-start-game").innerText = "Start Game (Need ≥ 2 players)";
  document.getElementById("lobby-wait-msg").style.display = "none";
  
  offlinePlayers = [];
  renderOfflinePlayers();
  
  // Populate settings checkboxes locally if not already done
  bindHostLobbyControls();
  
  showScreen("lobby");
}

function addOfflinePlayer() {
  const input = document.getElementById("offline-player-name-input");
  const name = input.value.trim().substring(0, 16);
  if (!name) return;
  
  const exists = offlinePlayers.some(p => p.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    alert("This player name is already registered!");
    return;
  }
  
  offlinePlayers.push({
    name: name,
    score: 0
  });
  
  input.value = "";
  renderOfflinePlayers();
  
  const btnStart = document.getElementById("btn-start-game");
  if (offlinePlayers.length >= 2) {
    btnStart.disabled = false;
    btnStart.innerText = "🚀 Start Offline Game";
  } else {
    btnStart.disabled = true;
    btnStart.innerText = "Start Game (Need ≥ 2 players)";
  }
  input.focus();
}

function removeOfflinePlayer(index) {
  offlinePlayers.splice(index, 1);
  renderOfflinePlayers();
  
  const btnStart = document.getElementById("btn-start-game");
  if (offlinePlayers.length >= 2) {
    btnStart.disabled = false;
    btnStart.innerText = "🚀 Start Offline Game";
  } else {
    btnStart.disabled = true;
    btnStart.innerText = "Start Game (Need ≥ 2 players)";
  }
}

function renderOfflinePlayers() {
  const listDiv = document.getElementById("lobby-player-list");
  listDiv.innerHTML = "";
  
  offlinePlayers.forEach((p, idx) => {
    const div = document.createElement("div");
    div.className = "player-item me";
    div.innerHTML = `
      <div style="flex: 1; font-weight: bold;">👤 ${p.name}</div>
      <button class="btn btn-danger btn-sm" style="padding: 2px 8px; font-size: 0.75rem; border-radius: 4px;" onclick="removeOfflinePlayer(${idx})">&times;</button>
    `;
    listDiv.appendChild(div);
  });
  
  document.getElementById("player-count").innerText = offlinePlayers.length;
}

// Make globally accessible for the onclick attribute
window.removeOfflinePlayer = removeOfflinePlayer;

function startOfflineGame() {
  if (offlinePlayers.length < 2) return;
  
  offlineMaxRounds = parseInt(document.getElementById("select-rounds").value) || 5;
  offlineDuration = parseInt(document.getElementById("select-timer").value) || 30;
  
  offlineCategories = [];
  document.querySelectorAll("#lobby-categories-list input:checked").forEach(cb => {
    offlineCategories.push(cb.value);
  });
  if (offlineCategories.length === 0) {
    offlineCategories = Object.keys(CATEGORIES);
  }
  
  offlineRound = 1;
  offlineGiverIndex = 0;
  offlineGameHistory = [];
  
  setupOfflineRound(1);
}

function setupOfflineRound(roundNum) {
  confettiSystem.stop();
  offlineRound = roundNum;
  offlineViolationDeduction = 0;
  
  const giverName = offlinePlayers[offlineGiverIndex].name;
  
  offlineCategory = getRandomCategory(offlineCategories);
  offlineTargetWord = getRandomWord(offlineCategory, null, offlineGameHistory.map(h => h.targetWord.toLowerCase()));
  
  offlineConstraint = CONSTRAINTS[Math.floor(Math.random() * CONSTRAINTS.length)];
  
  showScreen("role-reveal");
  
  const revealTitle = document.getElementById("role-reveal-title");
  const revealIcon = document.getElementById("role-reveal-icon");
  const revealDesc = document.getElementById("role-reveal-desc");
  
  revealTitle.className = "role-reveal-title hint-giver";
  revealTitle.innerText = "PASS DEVICE";
  revealIcon.innerText = "🎯";
  revealDesc.innerHTML = `Pass the device to **${giverName}**.<br><br>Giver must describe the word while obeying constraints. Other players shout guesses!`;
  
  document.getElementById("btn-offline-reveal-confirm").style.display = "inline-flex";
}

function showOfflineHinting() {
  document.getElementById("btn-offline-reveal-confirm").style.display = "none";
  showScreen("hinting");
  
  document.querySelectorAll(".current-round-number").forEach(el => el.innerText = offlineRound);
  document.querySelectorAll(".max-rounds-number").forEach(el => el.innerText = offlineMaxRounds);
  
  document.getElementById("hinting-category").innerText = offlineCategory;
  document.getElementById("hinting-word").innerText = offlineTargetWord;
  
  document.getElementById("hinting-constraint-icon").innerText = offlineConstraint.icon;
  document.getElementById("hinting-constraint-label").innerText = offlineConstraint.label;
  document.getElementById("hinting-constraint-desc").innerText = offlineConstraint.description;
  
  // Hide online text entry panel, show offline buttons panel
  document.getElementById("hint-input").parentElement.style.display = "none";
  document.getElementById("online-hinting-controls").style.display = "none";
  document.getElementById("offline-hinting-panel").style.display = "flex";
  
  document.getElementById("hinting-feed").innerHTML = `
    <div class="empty-hints" style="font-size: 0.9rem; text-align: center; color: var(--accent-yellow);">
      Speak your hints out loud! Keep your hands off the keyboard.
    </div>
  `;
  document.getElementById("hinting-count-badge").innerText = "🔊";
  
  const guesserBtnsDiv = document.getElementById("offline-guesser-buttons");
  guesserBtnsDiv.innerHTML = "";
  
  offlinePlayers.forEach((p, idx) => {
    if (idx !== offlineGiverIndex) {
      const btn = document.createElement("button");
      btn.className = "btn btn-sm btn-success";
      btn.style.width = "100%";
      btn.style.margin = "4px 0";
      btn.innerText = `🎯 Correct: ${p.name}`;
      btn.onclick = () => endOfflineRound(idx);
      guesserBtnsDiv.appendChild(btn);
    }
  });
  
  const mockTimer = {
    duration: offlineDuration,
    startedAt: Date.now()
  };
  
  offlineTimerStartedAt = mockTimer.startedAt;
  
  startClientTimer(mockTimer, "hinting-timer-bar", () => {
    endOfflineRound(null);
  });
}

function recordOfflineViolation() {
  offlineViolationDeduction += 20;
  triggerFloatingEmoji("⚠️");
  
  const feedback = document.getElementById("hint-validation-feedback");
  feedback.innerText = `Constraint Broken! -20 pts penalty will be applied.`;
  feedback.className = "validation-feedback invalid";
  
  const container = document.getElementById("main-container");
  container.classList.add("shake-animation");
  setTimeout(() => container.classList.remove("shake-animation"), 500);
}

function endOfflineRound(winnerIndex) {
  if (timerInterval) clearInterval(timerInterval);
  
  const giverIdx = offlineGiverIndex;
  const giverName = offlinePlayers[giverIdx].name;
  
  offlineRoundScores = {};
  offlineWinnerName = "Nobody";
  offlineWinnerId = "none";
  
  let guesserPoints = 0;
  let giverPoints = 0;
  
  if (winnerIndex !== null) {
    const winnerName = offlinePlayers[winnerIndex].name;
    offlineWinnerName = winnerName;
    offlineWinnerId = winnerIndex.toString();
    
    // Scale guesser points based on time left
    const elapsed = (Date.now() - offlineTimerStartedAt) / 1000;
    const ratio = Math.max(0, (offlineDuration - elapsed) / offlineDuration);
    
    if (ratio > 0.66) {
      guesserPoints = 100;
    } else if (ratio > 0.33) {
      guesserPoints = 75;
    } else {
      guesserPoints = 50;
    }
    
    giverPoints = Math.max(-50, 60 - offlineViolationDeduction);
    
    offlinePlayers[winnerIndex].score += guesserPoints;
    offlinePlayers[giverIdx].score += giverPoints;
    
    offlineRoundScores[winnerIndex] = guesserPoints;
    offlineRoundScores[giverIdx] = giverPoints;
    
    confettiSystem.start();
  } else {
    giverPoints = -30 - offlineViolationDeduction;
    offlinePlayers[giverIdx].score = Math.max(0, offlinePlayers[giverIdx].score + giverPoints);
    
    offlineRoundScores[giverIdx] = giverPoints;
  }
  
  offlineGameHistory.push({
    round: offlineRound,
    targetWord: offlineTargetWord,
    category: offlineCategory,
    giver: giverName,
    hintText: winnerIndex !== null ? `Guessed by ${offlineWinnerName}` : "Skipped/Time Out",
    constraintLabel: offlineConstraint.label,
    pointsGained: giverPoints
  });
  
  showOfflineResults(winnerIndex);
}

function showOfflineResults(winnerIndex) {
  showScreen("results");
  
  document.getElementById("results-target-word-val").innerText = offlineTargetWord;
  
  document.getElementById("voting-panel").style.display = "none";
  document.getElementById("voting-status-panel").style.display = "none";
  
  const breakdownDiv = document.getElementById("results-breakdown-list");
  breakdownDiv.innerHTML = "";
  
  Object.keys(offlineRoundScores).forEach(idxStr => {
    const idx = parseInt(idxStr);
    const pName = offlinePlayers[idx].name;
    const scoreVal = offlineRoundScores[idx];
    
    const row = document.createElement("div");
    row.className = "score-row";
    row.innerHTML = `
      <span>${pName}</span>
      <span class="score-change ${scoreVal >= 0 ? 'positive' : 'negative'}">${scoreVal >= 0 ? '+' : ''}${scoreVal} pts</span>
    `;
    breakdownDiv.appendChild(row);
  });
  
  if (Object.keys(offlineRoundScores).length === 0) {
    breakdownDiv.innerHTML = "<div class='empty-hints'>No score adjustments.</div>";
  }
  
  renderOfflineLeaderboard("results-leaderboard");
  
  const btnNext = document.getElementById("btn-next-round");
  btnNext.style.display = "inline-flex";
  btnNext.innerText = (offlineRound >= offlineMaxRounds) ? "🏆 Finish Game" : "Next Round →";
  document.getElementById("results-wait-msg").style.display = "none";
}

function renderOfflineLeaderboard(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  
  const sorted = [...offlinePlayers].sort((a, b) => b.score - a.score);
  
  sorted.forEach((p, idx) => {
    const isWinner = (idx === 0 && p.score > 0);
    
    const row = document.createElement("div");
    row.className = `leaderboard-row ${isWinner ? 'winner-row' : ''}`;
    
    let medal = "👤";
    if (idx === 0) medal = "🥇";
    else if (idx === 1) medal = "🥈";
    else if (idx === 2) medal = "🥉";
    
    row.innerHTML = `
      <div class="leaderboard-player-info">
        <span class="leaderboard-avatar">${medal}</span>
        <span style="font-weight: 700;">${p.name}</span>
      </div>
      <div class="leaderboard-score">${p.score} pts</div>
    `;
    container.appendChild(row);
  });
}

function advanceOfflineNextRound() {
  if (offlineRound >= offlineMaxRounds) {
    showOfflineGameOver();
  } else {
    offlineGiverIndex = (offlineGiverIndex + 1) % offlinePlayers.length;
    setupOfflineRound(offlineRound + 1);
  }
}

function showOfflineGameOver() {
  showScreen("gameOver");
  confettiSystem.start();
  
  renderOfflineLeaderboard("gameover-leaderboard");
  
  const historyDiv = document.getElementById("gameover-history-list");
  historyDiv.innerHTML = "";
  
  offlineGameHistory.forEach(h => {
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
      <div>Round ${h.round} target: <span class="history-word">${h.targetWord}</span> (${h.category})</div>
      <div class="history-hint">${h.hintText}</div>
      <div class="history-votes">Constraint: ${h.constraintLabel} | Giver Round Score: ${h.pointsGained} pts</div>
    `;
    historyDiv.appendChild(item);
  });
  
  if (offlineGameHistory.length === 0) {
    historyDiv.innerHTML = "<div class='empty-hints'>No history recap available.</div>";
  }
  
  const btnPlayAgain = document.getElementById("btn-play-again");
  btnPlayAgain.style.display = "inline-flex";
  document.getElementById("gameover-wait-msg").style.display = "none";
}

function resetOfflineGame() {
  confettiSystem.stop();
  offlinePlayers.forEach(p => p.score = 0);
  
  offlineRound = 1;
  offlineGiverIndex = 0;
  offlineGameHistory = [];
  
  setupOfflineRound(1);
}

function exitOfflineMode() {
  isOfflineMode = false;
  
  document.querySelector(".room-code-panel").style.display = "block";
  document.getElementById("offline-add-player-panel").style.display = "none";
  document.getElementById("lobby-spectator-toggle").parentElement.style.display = "block";
  
  document.getElementById("hint-input").parentElement.style.display = "block";
  document.getElementById("online-hinting-controls").style.display = "flex";
  document.getElementById("offline-hinting-panel").style.display = "none";
  
  if (timerInterval) clearInterval(timerInterval);
  confettiSystem.stop();
  
  document.getElementById("btn-create-lobby").style.display = "inline-flex";
  document.getElementById("btn-show-join").style.display = "inline-flex";
  document.getElementById("join-code-container").style.display = "none";
  document.getElementById("join-action-container").style.display = "none";
  
  showScreen("home");
}

function shareOfflineScoreCard() {
  const sorted = [...offlinePlayers].sort((a, b) => b.score - a.score);
  
  let card = "🏆 THE RESTRICTED SPEAKER SCORECARD (OFFLINE MODE) 🏆\n\n";
  sorted.forEach((p, idx) => {
    let medal = "👤";
    if (idx === 0) medal = "🥇";
    else if (idx === 1) medal = "🥈";
    else if (idx === 2) medal = "🥉";
    card += `${medal} ${p.name}: ${p.score} pts\n`;
  });
  card += "\nPlay 'The Restricted Speaker' now! 🚫☝️👻❓";
  
  navigator.clipboard.writeText(card);
  alert("Score card copied to clipboard! Share it with friends.");
}

// =================================================================
// ===         PLAY LOCAL MODE ENGINE (Zero Firebase)           ===
// =================================================================

let localGame = {
  players: [],           // [{ name, score }]
  selectedCategories: [],
  maxRounds: 5,
  timerDuration: 15,
  maxHints: 3,          // kept for setup UI compatibility

  currentRound: 0,
  currentHintGiverIndex: 0,
  phase: "setup",

  currentCategory: "",
  targetWord: "",
  currentConstraint: null,
  allHintHistory: [],      // cumulative across all rounds for game-over recap
  wordsCorrect: 0,         // correct GOT IT taps this round
  wordsSkipped: 0,         // SKIP taps this round
  roundWinner: null,
  pointsThisRound: {},
  timerInterval: null,
  timeRemaining: 0
};

// ---- Utility ----
function localUpdateStartBtn() {
  const btn = document.getElementById("btn-local-start");
  const catSelected = document.querySelectorAll("#local-category-grid .cat-chip.selected").length;
  btn.disabled = catSelected === 0;
}

// ---- Mode Entry/Exit ----
function startLocalMode() {
  confettiSystem.stop();
  localGame.players = [{ name: "Guesser", score: 0 }];
  localGame.phase = "setup";

  // Render category chips for local setup
  const grid = document.getElementById("local-category-grid");
  grid.innerHTML = "";
  Object.keys(CATEGORIES).forEach(cat => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cat-chip selected";
    btn.textContent = cat;
    btn.dataset.category = cat;
    btn.addEventListener("click", () => {
      const selected = grid.querySelectorAll(".cat-chip.selected").length;
      if (btn.classList.contains("selected") && selected <= 1) {
        alert("Select at least one category!");
        return;
      }
      btn.classList.toggle("selected");
      localUpdateStartBtn();
    });
    grid.appendChild(btn);
  });

  localUpdateStartBtn();
  showScreen("local-setup");
}

function exitLocalMode() {
  stopLocalTimer();
  disableTilt();
  confettiSystem.stop();
  document.body.style.background = ""; // Restore default background style
  localGame = { ...localGame, players: [], phase: "setup", currentRound: 0, allHintHistory: [] };
  showScreen("home");
}

// ---- Game Start ----
function startLocalGame() {
  // Fullscreen
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }

  localGame.maxRounds = 1;
  localGame.timerDuration = parseInt(document.getElementById("local-select-timer").value) || 15;
  localGame.selectedCategories = getSelectedChips("local-category-grid");
  if (localGame.selectedCategories.length === 0) localGame.selectedCategories = Object.keys(CATEGORIES);

  localGame.players = [{ name: "Guesser", score: 0 }];
  localGame.currentRound = 0;
  localGame.currentHintGiverIndex = 0;
  localGame.allHintHistory = [];
  localGame.consecutiveCorrect = 0;
  
  // Request tilt controls
  requestTiltPermission();

  startLocalRound();
}

function startLocalRound() {
  localGame.currentRound++;
  localGame.wordsCorrect = 0;
  localGame.wordsSkipped = 0;
  localGame.roundWinner = null;
  localGame.pointsThisRound = {};
  localGame.phase = "charades";

  showLocalHandoff();
}

// ---- L2: Handoff Screen ----
function showLocalHandoff() {
  stopLocalTimer();
  const giver = localGame.players[localGame.currentHintGiverIndex];
  document.getElementById("local-handoff-name").textContent = giver.name.toUpperCase();
  document.getElementById("local-handoff-round").textContent = localGame.currentRound;
  document.getElementById("local-handoff-maxrounds").textContent = localGame.maxRounds;
  showScreen("local-handoff");
}

// ---- Chunk 3: Sound Design ----
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    const sounds = { correct:[880,'sine',0.15], skip:[220,'sawtooth',0.12], tick:[440,'sine',0.08], go:[1046,'sine',0.2], end:[660,'sine',0.6] };
    const [freq, type2, dur] = sounds[type];
    o.frequency.value = freq; o.type = type2;
    g.gain.setValueAtTime(0.3, 0);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch (e) {
    console.warn("AudioContext blocked or not supported: ", e);
  }
}

// ---- Chunk 2: Tilt Controls ----
let tiltActive = false;
let lastTiltTime = 0;

function requestTiltPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(state => {
        if (state === 'granted') {
          enableTilt();
        } else {
          disableTilt();
        }
      })
      .catch(() => {
        disableTilt();
      });
  } else {
    enableTilt();
  }
}

function enableTilt() {
  tiltActive = true;
  const badge = document.getElementById("charades-tilt-badge");
  if (badge) badge.style.display = "block";
  const skipBtn = document.getElementById("btn-local-skip");
  const gotBtn = document.getElementById("btn-local-got-it");
  if (skipBtn) skipBtn.style.display = "none";
  if (gotBtn) gotBtn.style.display = "none";
  
  window.removeEventListener("deviceorientation", handleTiltEvent);
  window.addEventListener("deviceorientation", handleTiltEvent);
}

function disableTilt() {
  tiltActive = false;
  const badge = document.getElementById("charades-tilt-badge");
  if (badge) badge.style.display = "none";
  const skipBtn = document.getElementById("btn-local-skip");
  const gotBtn = document.getElementById("btn-local-got-it");
  if (skipBtn) skipBtn.style.display = "flex";
  if (gotBtn) gotBtn.style.display = "flex";
  
  window.removeEventListener("deviceorientation", handleTiltEvent);
}

function handleTiltEvent(event) {
  if (localGame.phase !== "charades" || !tiltActive) return;
  const now = Date.now();
  if (now - lastTiltTime < 800) return;

  if (event.beta > 25) {
    lastTiltTime = now;
    localGotIt();
  } else if (event.beta < -25) {
    lastTiltTime = now;
    localSkip();
  }
}

// ---- Chunk 4 & 6: Round Cinematic & Chaos Events ----
function checkAndRunRoundStart() {
  localGame.totalRoundsPlayed = (localGame.totalRoundsPlayed || 0) + 1;
  if (localGame.totalRoundsPlayed % 3 === 0) {
    triggerChaosEvent();
  } else {
    runLocalCinematic();
  }
}

function triggerChaosEvent() {
  const chaos = CHAOS_EVENTS[Math.floor(Math.random() * CHAOS_EVENTS.length)];
  const banner = document.getElementById("chaos-banner");
  document.getElementById("chaos-banner-text").textContent = chaos;
  
  localGame.isSpeedRound = false;
  const originalTimer = localGame.timerDuration;
  
  if (chaos.includes("SPEED ROUND")) {
    localGame.isSpeedRound = true;
    localGame.timerDuration = Math.round(originalTimer / 2);
  }

  banner.style.display = "flex";
  banner.classList.add("active");

  setTimeout(() => {
    banner.classList.remove("active");
    banner.style.display = "none";
    runLocalCinematic(() => {
      if (localGame.isSpeedRound) {
        localGame.timerDuration = originalTimer;
      }
    });
  }, 3000);
}

function runLocalCinematic(onFinish) {
  const screen = document.getElementById("cinematic-screen");
  const countEl = document.getElementById("cinematic-countdown");
  const catEl = document.getElementById("cinematic-category");

  catEl.textContent = localGame.currentCategory.toUpperCase();
  screen.style.display = "flex";
  screen.style.background = "#0d1117";

  let step = 3;
  
  function showStep() {
    if (step > 0) {
      countEl.textContent = step;
      countEl.classList.remove("cinematic-zoom");
      void countEl.offsetWidth; // trigger reflow
      countEl.classList.add("cinematic-zoom");
      playSound('tick');
      step--;
      setTimeout(showStep, 800);
    } else {
      // GO!
      countEl.textContent = "GO!";
      countEl.classList.remove("cinematic-zoom");
      void countEl.offsetWidth; // trigger reflow
      countEl.classList.add("cinematic-zoom");
      
      // White flash
      screen.style.background = "#fff";
      setTimeout(() => {
        screen.style.background = "#0d1117";
      }, 150);

      if (navigator.vibrate) navigator.vibrate(200);
      playSound('go');

      setTimeout(() => {
        screen.style.display = "none";
        showLocalCharades();
        if (onFinish) onFinish();
      }, 400);
    }
  }
  showStep();
}

function triggerModifierOverlay() {
  const mod = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
  const banner = document.getElementById("modifier-banner");
  document.getElementById("modifier-banner-text").textContent = mod;
  
  banner.style.display = "flex";
  banner.classList.add("active");
  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

  setTimeout(() => {
    banner.classList.remove("active");
    banner.style.display = "none";
    resumeTimer();
  }, 2000);
}

// ---- L3: Peek / Ready Screen ----
function showLocalPeek() {
  // Pick word and constraint for this round
  const cats = localGame.selectedCategories;
  const cat = cats[Math.floor(Math.random() * cats.length)];
  const usedWords = localGame.allHintHistory.map(h => h.word);
  localGame.currentCategory = cat;
  localGame.targetWord = getRandomWord(cat, null, usedWords);
  localGame.currentConstraint = CONSTRAINTS[Math.floor(Math.random() * CONSTRAINTS.length)];

  // 3-second auto-start countdown
  let countdown = 3;
  const countEl = document.getElementById("local-peek-countdown");
  countEl.textContent = countdown;

  const peekInterval = setInterval(() => {
    countdown--;
    countEl.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(peekInterval);
      checkAndRunRoundStart();
    }
  }, 1000);

  document.getElementById("btn-local-ready-hide").onclick = () => {
    clearInterval(peekInterval);
    checkAndRunRoundStart();
  };

  showScreen("local-peek");
}

// ---- L4: Charades Screen (replaces Hinting + Guessing) ----
// ---- L4: Charades Screen (replaces Hinting + Guessing) ----
function showLocalCharades() {
  stopLocalTimer();
  localGame.phase = "charades";

  const giver = localGame.players[localGame.currentHintGiverIndex];
  const c = localGame.currentConstraint;

  // Apply theme background gradient
  const theme = CATEGORY_THEMES[localGame.currentCategory];
  if (theme && theme.gradient) {
    document.body.style.background = theme.gradient;
  } else {
    document.body.style.background = "linear-gradient(135deg, var(--bg-main), var(--bg-secondary))";
  }

  // Top bar
  document.getElementById("charades-round-label").textContent =
    `ROUND ${localGame.currentRound}/${localGame.maxRounds}`;
  document.getElementById("charades-guesser-name").textContent = giver.name.toUpperCase();
  document.getElementById("charades-category-label").textContent = localGame.currentCategory;

  // Word + constraint
  document.getElementById("charades-word").textContent = localGame.targetWord.toUpperCase();
  document.getElementById("charades-constraint-icon").textContent = c.icon;
  document.getElementById("charades-constraint-text").textContent =
    `${c.label} — ${c.description}`;

  // Score badge
  document.getElementById("charades-score-badge").textContent =
    `${localGame.wordsCorrect} correct`;

  // Timer bar reset
  const fill = document.getElementById("charades-timer-fill");
  fill.style.width = "100%";
  fill.classList.remove("timer-critical");

  showScreen("local-hinting");

  // Start timer — shrinks the progress bar
  startLocalTimer(
    localGame.timerDuration,
    (rem) => {
      const pct = (rem / localGame.timerDuration) * 100;
      fill.style.width = pct + "%";
      if (rem <= Math.floor(localGame.timerDuration * 0.25)) {
        fill.classList.add("timer-critical");
      }
    },
    () => {
      endLocalCharadesRound();
    }
  );
}

function loadNextCharadesWordNoAnim() {
  const usedWords = localGame.allHintHistory.map(h => h.word);
  localGame.targetWord = getRandomWord(localGame.currentCategory, null, usedWords);
  document.getElementById("charades-word").textContent = localGame.targetWord.toUpperCase();
  document.getElementById("charades-score-badge").textContent = `${localGame.wordsCorrect} correct`;
}

function localGotIt() {
  if (localGame.phase !== "charades") return;
  stopLocalTimer();

  // Play correct sound
  playSound('correct');

  const wordEl = document.getElementById("charades-word");
  wordEl.classList.remove("slide-in-bottom", "slide-up", "slide-down");
  void wordEl.offsetWidth; // force reflow
  wordEl.classList.add("slide-up");

  // flash background
  const originalBg = document.body.style.background;
  document.body.style.background = '#00ff0033';
  setTimeout(() => {
    document.body.style.background = originalBg;
  }, 150);

  if (navigator.vibrate) navigator.vibrate(80);

  const giver = localGame.players[localGame.currentHintGiverIndex];
  const pts = 100;
  giver.score += pts;
  localGame.pointsThisRound[giver.name] = (localGame.pointsThisRound[giver.name] || 0) + pts;
  localGame.wordsCorrect++;
  localGame.roundWinner = { name: giver.name, points: pts * localGame.wordsCorrect };

  // Log for game history
  localGame.allHintHistory.push({ word: localGame.targetWord, giver: giver.name });

  // Increment consecutive correct answers
  localGame.consecutiveCorrect = (localGame.consecutiveCorrect || 0) + 1;

  // Trigger modifier after every 5 consecutive correct answers
  const hasModifier = localGame.consecutiveCorrect > 0 && localGame.consecutiveCorrect % 5 === 0;

  setTimeout(() => {
    // Swap word
    loadNextCharadesWordNoAnim();

    wordEl.classList.remove("slide-up");
    void wordEl.offsetWidth;
    wordEl.classList.add("slide-in-bottom");

    if (hasModifier) {
      triggerModifierOverlay();
    } else {
      resumeTimer();
    }
  }, 200);
}

function localSkip() {
  if (localGame.phase !== "charades") return;
  stopLocalTimer();

  // Play skip sound
  playSound('skip');

  const wordEl = document.getElementById("charades-word");
  wordEl.classList.remove("slide-in-bottom", "slide-up", "slide-down");
  void wordEl.offsetWidth; // force reflow
  wordEl.classList.add("slide-down");

  // flash background
  const originalBg = document.body.style.background;
  document.body.style.background = '#ff000033';
  setTimeout(() => {
    document.body.style.background = originalBg;
  }, 150);

  if (navigator.vibrate) navigator.vibrate([40, 30, 40]);

  localGame.wordsSkipped++;
  localGame.allHintHistory.push({ word: localGame.targetWord, giver: localGame.players[localGame.currentHintGiverIndex].name });
  
  // Reset consecutive correct answers
  localGame.consecutiveCorrect = 0;

  setTimeout(() => {
    // Swap word
    loadNextCharadesWordNoAnim();

    wordEl.classList.remove("slide-down");
    void wordEl.offsetWidth;
    wordEl.classList.add("slide-in-bottom");

    resumeTimer();
  }, 200);
}

function resumeTimer() {
  const fill = document.getElementById("charades-timer-fill");
  startLocalTimer(
    localGame.timeRemaining,
    (rem) => {
      const pct = (rem / localGame.timerDuration) * 100;
      fill.style.width = pct + "%";
      if (rem <= Math.floor(localGame.timerDuration * 0.25)) {
        fill.classList.add("timer-critical");
      }
    },
    () => endLocalCharadesRound()
  );
}

function endLocalCharadesRound() {
  stopLocalTimer();
  disableTilt();
  
  // Play end round sound
  playSound('end');

  const correct = localGame.wordsCorrect;
  const skipped = localGame.wordsSkipped;
  const total = correct + skipped;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  let label = "";
  if (accuracy >= 90) label = "Sharma Ji Ka Beta 🏆";
  else if (accuracy >= 70) label = "Delhi Genius 🧠";
  else if (accuracy >= 50) label = "Traffic Jam Brain 🚗";
  else if (accuracy >= 30) label = "Absolute Bakchod 💀";
  else label = "Bhai Soja Thoda 😴";

  document.getElementById("results-correct").textContent = `✅ ${correct} Correct`;
  document.getElementById("results-skipped").textContent = `⏭ ${skipped} Skipped`;
  document.getElementById("results-accuracy").textContent = `Accuracy: ${accuracy}%`;
  document.getElementById("results-rating").textContent = label;

  // Slide up results card
  const resScreen = document.getElementById("results-screen");
  resScreen.style.display = "flex";
  void resScreen.offsetWidth; // force reflow
  resScreen.classList.add("active");

  // Wire buttons
  document.getElementById("btn-results-again").onclick = () => {
    resScreen.classList.remove("active");
    setTimeout(() => { resScreen.style.display = "none"; }, 300);
    localPlayAgain();
  };

  document.getElementById("btn-results-next-cat").onclick = () => {
    resScreen.classList.remove("active");
    setTimeout(() => { resScreen.style.display = "none"; }, 300);
    exitLocalMode();
  };

  document.getElementById("btn-results-share").onclick = () => {
    const shareText = `I got ${correct} correct in The Restricted Speaker! Rating: ${label}`;
    if (navigator.share) {
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText)
        .then(() => alert("Score copied to clipboard!"))
        .catch(() => alert("Could not copy score."));
    }
  };
}

function localPlayAgain() {
  confettiSystem.stop();
  localGame.players.forEach(p => p.score = 0);
  localGame.currentRound = 0;
  localGame.currentHintGiverIndex = 0;
  localGame.allHintHistory = [];
  localGame.consecutiveCorrect = 0;
  
  // Re-request / enable tilt
  requestTiltPermission();

  startLocalRound();
}

// ---- Timer ----
function startLocalTimer(duration, onTick, onExpire) {
  stopLocalTimer();
  localGame.timeRemaining = duration;
  localGame.timerInterval = setInterval(() => {
    localGame.timeRemaining -= 1;
    if (onTick) onTick(localGame.timeRemaining);
    if (localGame.timeRemaining <= 0) {
      clearInterval(localGame.timerInterval);
      localGame.timerInterval = null;
      if (onExpire) onExpire();
    }
  }, 1000);
}

function stopLocalTimer() {
  if (localGame.timerInterval) {
    clearInterval(localGame.timerInterval);
    localGame.timerInterval = null;
  }
}

