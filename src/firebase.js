import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAvmA2HNjHr_Y16FaBtBRZaTN8bF1cGF8U",
  authDomain: "covoitapp-58bdc.firebaseapp.com",
  projectId: "covoitapp-58bdc",
  storageBucket: "covoitapp-58bdc.firebasestorage.app",
  messagingSenderId: "965956999518",
  appId: "1:965956999518:web:2e74975c160034fd9c57cf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;