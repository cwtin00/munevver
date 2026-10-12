// Sureyya Kafe Firebase web configuration (Firebase compat SDK v10).
// This project is isolated from Roof Cafe.
const sureyyaFirebaseConfig = {
  apiKey: "AIzaSyBwkVJmubmEdSdNOp7bxP8sNHNLeLfJv1A",
  authDomain: "munevver-76d00.firebaseapp.com",
  databaseURL: "https://munevver-76d00-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "munevver-76d00",
  storageBucket: "munevver-76d00.firebasestorage.app",
  messagingSenderId: "390958073057",
  appId: "1:390958073057:web:5897a19544eee94c30e3a0",
  measurementId: "G-10V6367DJV"
};
const sureyyaApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(sureyyaFirebaseConfig);
// Existing menu/admin scripts use these legacy variable names.
window.roofDb = sureyyaApp.database();
window.roofAuth = sureyyaApp.auth();
