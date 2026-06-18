const firebaseConfig = {
  apiKey: "AIzaSyAjalHOiHYC2bhWjNj1X5Gr-2JhDhD2Qkg",
  authDomain: "sports-lcm.firebaseapp.com",
  projectId: "sports-lcm",
  storageBucket: "sports-lcm.firebasestorage.app",
  messagingSenderId: "625112415751",
  appId: "1:625112415751:web:a4cbcd3cd84bbf3b2934a2",
};

// Initialize Firebase using the Compat syntax
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore
const db = firebase.firestore();