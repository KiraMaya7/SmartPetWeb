// Importar funciones de Firebase correctamente
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc, setDoc, getDoc, query, orderBy, limit, where } from "firebase/firestore"
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
  measurementId: "G-7HP45BZHXD"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)
const analytics = getAnalytics(app)

// Colecciones
const COLLECTIONS = {
  DEVICES: 'dispositivos',
  HISTORY: 'historial'
}

export { 
  db, 
  auth, 
  storage, 
  analytics, 
  COLLECTIONS,
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
  where
}