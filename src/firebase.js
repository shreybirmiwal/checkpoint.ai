// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAIM-yVmX2Kl3n5PLLxoocCsAg-jI9aU3s",
    authDomain: "checkpoint-ai-fa789.firebaseapp.com",
    projectId: "checkpoint-ai-fa789",
    storageBucket: "checkpoint-ai-fa789.appspot.com",
    messagingSenderId: "181595377130",
    appId: "1:181595377130:web:54392b69c8c27955dcf693"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app);