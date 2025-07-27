import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyBkuiZCqrADfom5TXNBfg4gx0YdYNGQOxQ",
  authDomain: "opengmilitarysupplies.firebaseapp.com",
  projectId: "opengmilitarysupplies",
  storageBucket: "opengmilitarysupplies.firebasestorage.app",
  messagingSenderId: "178476385669",
  appId: "1:178476385669:web:a81a040077cced2f1e30ec"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);