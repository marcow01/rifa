import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC73UfQBPU0bLAwalmtg_VDJMfi7L39X34",
  authDomain: "bancodados-e5ddf.firebaseapp.com",
  projectId: "bancodados-e5ddf",
  storageBucket: "bancodados-e5ddf.firebasestorage.app",
  messagingSenderId: "214365971585",
  appId: "1:214365971585:web:2bb05e05dd75b8d66a5980"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);