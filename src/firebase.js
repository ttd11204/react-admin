// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhy6GPeGx8vrdnmCTX9PYC-7ComeW_fWY",
  authDomain: "authentication-318f7.firebaseapp.com",
  projectId: "authentication-318f7",
  storageBucket: "authentication-318f7.appspot.com",
  messagingSenderId: "650590225470",
  appId: "1:650590225470:web:1da64f8ced18f1a5113d6f",
  measurementId: "G-YY5ZE9JCKR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app)

export {app, auth} 