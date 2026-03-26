import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBqYDm_U2r2WsvoLn9rVBrf711nOJGXANQ",
  authDomain: "bookshare-bookstore.firebaseapp.com",
  projectId: "bookshare-bookstore",
  storageBucket: "bookshare-bookstore.firebasestorage.app",
  messagingSenderId: "377216705975",
  appId: "1:377216705975:web:fee445fbadb1720eefb432",
  measurementId: "G-VJZE0RN4ZD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Export this to use in your context