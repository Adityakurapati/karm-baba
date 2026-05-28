import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAj7RTpWvjoni-xQTJfddKJUwzdqsdCc34",
  authDomain: "thirdeye-1e99c.firebaseapp.com",
  databaseURL: "https://thirdeye-1e99c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thirdeye-1e99c",
  storageBucket: "thirdeye-1e99c.firebasestorage.app",
  messagingSenderId: "409652334215",
  appId: "1:409652334215:web:b09ff8ed368841060a7222",
  measurementId: "G-QYFB57MP43"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { app, auth, database, storage, firebaseConfig };
