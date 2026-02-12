import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAiAN3RFjvApNfv9-3jQHdL4uFhEFF3MdE",
  authDomain: "first-saas-project-9b7c9.firebaseapp.com",
  projectId: "first-saas-project-9b7c9",
  storageBucket: "first-saas-project-9b7c9.firebasestorage.app",
  messagingSenderId: "1003138082601",
  appId: "1:1003138082601:web:4ad1f3d1997c4930c5f938"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
