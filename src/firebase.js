// firebase.js
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, setDoc, getDoc, query, orderBy, limit, where } from "firebase/firestore"
import { getDatabase, ref, set, get, onValue, update, push, remove } from "firebase/database"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyAyNs-LbME0UFrn6uum65YI51D7YKG-j_c",
  authDomain: "smartpet-26294.firebaseapp.com",
  projectId: "smartpet-26294",
  storageBucket: "smartpet-26294.firebasestorage.app",
  messagingSenderId: "94097820872",
  appId: "1:94097820872:web:fc075aad58161f369d69fd",
  measurementId: "G-7HP45BZHXD",
  databaseURL: "https://smartpet-26294-default-rtdb.firebaseio.com",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Firestore (para datos del dashboard)
const db = getFirestore(app)

// Realtime Database (para comunicación con ESP32)
const realtimeDb = getDatabase(app)

// Otros servicios
const auth = getAuth(app)
const storage = getStorage(app)
const analytics = getAnalytics(app)

// Colecciones de Firestore
const COLLECTIONS = {
  DEVICES: 'dispositivos',
  HISTORY: 'historial'
}

export { 
  db,
  realtimeDb,
  auth, 
  storage, 
  analytics, 
  COLLECTIONS,
  // Firestore
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  limit,
  where,
  // Realtime Database
  ref,
  set,
  get,
  onValue,
  update as realtimeUpdate,
  push,
  remove
}