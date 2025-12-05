// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCt2uGmuPTrrPlhfKFyp9pPnkyVYfj6GbA",
  authDomain: "ttsss-50788.firebaseapp.com",
  projectId: "ttsss-50788",
  storageBucket: "ttsss-50788.firebasestorage.app",
  messagingSenderId: "594651044868",
  appId: "1:594651044868:web:ae3122de7554ec39232951",
  measurementId: "G-3X5Y8PZPWF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
