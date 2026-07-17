import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBD1s5hIPKUAE6EjiQdLGQkEDSu4dFyQJc",
  authDomain: "birthdayweb-ae7a4.firebaseapp.com",
  projectId: "birthdayweb-ae7a4",
  storageBucket: "birthdayweb-ae7a4.firebasestorage.app",
  messagingSenderId: "116060213729",
  appId: "1:116060213729:web:76beacf0e893bd3f0fc2a0",
  measurementId: "G-4T09ZLHFY6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);