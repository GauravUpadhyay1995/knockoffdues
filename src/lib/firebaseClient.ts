import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, connectDatabaseEmulator, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL, // 🔥 important
};

let app;
try {
  const apps = getApps();
  app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  console.log("Firebase app initialized:", app.name);
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

export const db = getDatabase(app);
console.log("REALTIME-DATABASE-NAME",db)

// Optional: Log connection status
const connectedRef = ref(db, '.info/connected');
onValue(connectedRef, (snap) => {
  if (snap.val() === true) {
    console.log("✅ Connected to Firebase Realtime Database");
  } else {
    console.log("❌ Disconnected from Firebase");
  }
});
