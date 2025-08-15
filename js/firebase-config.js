// تهيئة Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

// تكوين Firebase الخاص بك
const firebaseConfig = {
  apiKey: "AIzaSyAz8COaUKi91zqLCiawMOo-I51FgHx8gp8",
  authDomain: "arab-24.firebaseapp.com",
  databaseURL: "https://arab-24-default-rtdb.firebaseio.com",
  projectId: "arab-24",
  storageBucket: "arab-24.appspot.com",
  messagingSenderId: "1051707223171",
  appId: "1:1051707223171:web:0f83c22a4ff9a042e8ffb6",
  measurementId: "G-B5EVD91MHD"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تصدير الخدمات المطلوبة
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
// مزود المصادقة - Google
const googleProvider = new firebase.auth.GoogleAuthProvider();