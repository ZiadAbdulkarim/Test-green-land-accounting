// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyB_tz6tkegK9Kc-GTgjQiJ6bDvKHriQWbQ",
  authDomain: "green-land-accounting-73b5c.firebaseapp.com",
  projectId: "green-land-accounting-73b5c",
  storageBucket: "green-land-accounting-73b5c.firebasestorage.app",
  messagingSenderId: "483945635463",
  appId: "1:483945635463:web:b33fae3181671637d36222"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();