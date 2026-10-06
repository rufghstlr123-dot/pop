import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, get, set, update, push, onValue, off } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAGWo-SFSIN8pCjlWUsVj3vxw13F1EM6dg",
  authDomain: "poprent-b205c.firebaseapp.com",
  databaseURL: "https://poprent-b205c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "poprent-b205c",
  storageBucket: "poprent-b205c.firebasestorage.app",
  messagingSenderId: "937595083489",
  appId: "1:937595083489:web:c0de17618de05ac21f75a0"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { app, db, ref, get, set, update, push, onValue, off };
