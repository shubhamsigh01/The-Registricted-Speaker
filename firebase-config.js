// Firebase SDK exports via CDN imports (safe for direct browser usage)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Global Firebase service references
export let app = null;
export let db = null;
export let auth = null;
export let isFirebaseReady = false;

// Your actual Firebase project configurations
const defaultFirebaseConfig = {
  apiKey: "AIzaSyAsfMXTbyUtGPMt1oXGEkh-hCSUa1gtSJs",
  authDomain: "restricted-speaker.firebaseapp.com",
  databaseURL: "https://restricted-speaker-default-rtdb.firebaseio.com",
  projectId: "restricted-speaker",
  storageBucket: "restricted-speaker.firebasestorage.app",
  messagingSenderId: "734563835031",
  appId: "1:734563835031:web:c863bc6a2d0ce1294c5dd2",
  measurementId: "G-RTDF20KSR6"
};

/**
 * Checks if a config object is using the default placeholder strings.
 */
export function isPlaceholderConfig(config) {
  return !config || 
         !config.apiKey || 
         config.apiKey.includes("YOUR_API_KEY") || 
         !config.databaseURL || 
         config.databaseURL.includes("YOUR_PROJECT");
}

/**
 * Retrieves the config from localStorage or defaults to the user's configured keys.
 */
export function getFirebaseConfig() {
  const saved = localStorage.getItem("restricted_speaker_firebase_config");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!isPlaceholderConfig(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse saved Firebase config:", e);
    }
  }
  return defaultFirebaseConfig;
}

/**
 * Saves a custom Firebase config to localStorage.
 */
export function saveFirebaseConfig(config) {
  if (config && !isPlaceholderConfig(config)) {
    localStorage.setItem("restricted_speaker_firebase_config", JSON.stringify(config));
    return true;
  }
  return false;
}

/**
 * Clears custom Firebase config from localStorage.
 */
export function clearFirebaseConfig() {
  localStorage.removeItem("restricted_speaker_firebase_config");
}

/**
 * Initializes the Firebase Application using the active configurations.
 */
export function initFirebase() {
  const config = getFirebaseConfig();
  if (isPlaceholderConfig(config)) {
    console.warn("Firebase configuration has placeholder values. Setup is required.");
    isFirebaseReady = false;
    return false;
  }
  
  try {
    app = initializeApp(config);
    db = getDatabase(app);
    auth = getAuth(app);
    isFirebaseReady = true;
    console.log("Firebase initialized successfully with config:", config.projectId);
    return true;
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    isFirebaseReady = false;
    return false;
  }
}