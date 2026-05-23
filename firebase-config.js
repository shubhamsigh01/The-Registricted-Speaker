/**
 * The Restricted Speaker — Firebase Configuration
 * Firebase client keys are safe to ship in browser code.
 * Security is enforced via Firebase Realtime Database Rules and Auth Rules.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAsfMXTbyUtGPMt1oXGEkh-hCSUa1gtSJs",
  authDomain: "restricted-speaker.firebaseapp.com",
  databaseURL: "https://restricted-speaker-default-rtdb.firebaseio.com",
  projectId: "restricted-speaker",
  storageBucket: "restricted-speaker.firebasestorage.app",
  messagingSenderId: "734563835031",
  appId: "1:734563835031:web:c863bc6a2d0ce1294c5dd2",
  measurementId: "G-RTDF20KSR6"
};

// Firebase service references — populated by initFirebase()
export let app = null;
export let db = null;
export let auth = null;
export let isFirebaseReady = false;

/**
 * Initialises Firebase once on page load.
 * Called from app.js DOMContentLoaded — always succeeds with the hardcoded config.
 */
export function initFirebase() {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    auth = getAuth(app);
    isFirebaseReady = true;
    console.log("Firebase initialised:", firebaseConfig.projectId);
    return true;
  } catch (error) {
    console.error("Firebase initialisation failed:", error);
    isFirebaseReady = false;
    return false;
  }
}