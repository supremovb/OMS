import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyDXTQalxF7I_uSQHJuRsq1F9jShNaK1Fec",
  authDomain: "oms-taguig.firebaseapp.com",
  projectId: "oms-taguig",
  storageBucket: "oms-taguig.firebasestorage.app",
  messagingSenderId: "887397394598",
  appId: "1:887397394598:web:048c6ecdf30e63aa7c6c67"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);