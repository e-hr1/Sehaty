// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDP1PoXMtol_LKbDTnNW_hLjdEVn9MxslA",
    authDomain: "arab-24-default-rtdb.firebaseapp.com",
    databaseURL: "https://arab-24-default-rtdb.firebaseio.com",
    projectId: "arab-24-default-rtdb",
    storageBucket: "arab-24-default-rtdb.appspot.com",
    messagingSenderId: "1051707223171",
    appId: "1:1051707223171:android:9ef039ef2b1306c3e8ffb6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// المراجع
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// مزود المصادقة - Google
const googleProvider = new firebase.auth.GoogleAuthProvider();