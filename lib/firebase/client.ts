"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDAe8PmP6sqIILyfQhjeee3hOwM_nhnKfw",
  authDomain: "hack-the-bias-2026.firebaseapp.com",
  projectId: "hack-the-bias-2026",
  storageBucket: "hack-the-bias-2026.firebasestorage.app",
  messagingSenderId: "98982311579",
  appId: "1:98982311579:web:9cc8c7b34938af5136383e",
  measurementId: "G-2VPQDWJ26S"
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);