// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKrsIdZEiaAkhf0shi1phBUnHob9Vj4Dk",
  authDomain: "managermenu-6bbd5.firebaseapp.com",
  projectId: "managermenu-6bbd5",
  storageBucket: "managermenu-6bbd5.firebasestorage.app",
  messagingSenderId: "1019910943262",
  appId: "1:1019910943262:web:1b35c1bbf4e26950f5740f",
  measurementId: "G-RL816NYMPT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, analytics };
export default app;