import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Added for database access

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxhzTK5jDdPompsfbtsbzbilWrBM71f7g",
  authDomain: "levelup-f7b70.firebaseapp.com",
  projectId: "levelup-f7b70",
  storageBucket: "levelup-f7b70.firebasestorage.app",
  messagingSenderId: "907887853291",
  appId: "1:907887853291:web:fe44c85e9c7877b72048ae",
  measurementId: "G-WF9ZLVQ24G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
