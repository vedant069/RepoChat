import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDXbtijpoiyRzWY6GqFBuZtGsoYJwSq4IM",
  authDomain: "interview-pro-d2bfa.firebaseapp.com",
  projectId: "interview-pro-d2bfa",
  storageBucket: "interview-pro-d2bfa.appspot.com",
  messagingSenderId: "784928195899",
  appId: "1:784928195899:web:a613651ca13a506c64a31e",
  measurementId: "G-8VM6M0XE82"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);