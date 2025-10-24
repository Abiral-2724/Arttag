// Import the functions you need from the SDKs you need
import { initializeApp ,getApp ,getApps} from "firebase/app";
import { getAuth } from "@firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA35DmXM_wi3HzwQ-04etkw4ElXuOjJU6c",
  authDomain: "arttag-login-new.firebaseapp.com",
  projectId: "arttag-login-new",
  storageBucket: "arttag-login-new.firebasestorage.app",
  messagingSenderId: "776791259974",
  appId: "1:776791259974:web:ab9c24d7a674ba839f8347",
  measurementId: "G-JDER0WMTKN"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp() ; 
const auth = getAuth(app) ; 
auth.useDeviceLanguage() ;
export {auth}