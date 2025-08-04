// frontend/src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// Se for usar Firestore:
import { getFirestore } from "firebase/firestore";
// Se for usar Auth:
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBctEBk4SodxNrCrmivPtwxe5uFaHiqj9M",
    authDomain: "ru-plataform.firebaseapp.com",
    projectId: "ru-plataform",
    storageBucket: "ru-plataform.firebasestorage.app",
    messagingSenderId: "745538205141",
    appId: "1:745538205141:web:0af2b2c10471ee3c60f95c",
    measurementId: "G-T78YG2BHWL"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
