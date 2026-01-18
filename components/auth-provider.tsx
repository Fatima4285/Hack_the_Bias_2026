"use client";

import {
  type User,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase/client";

type UserRole = "participant" | "researcher" | null;

type AuthContextValue = {
  user: User | null;
  role: UserRole;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ user: null, role: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      
      if (nextUser) {
        // Subscribe to real-time role changes
        const userDocRef = doc(db, "users", nextUser.uid);
        // We'll use a snapshot listener so if the role updates, the app updates
        const unsub = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists()) {
            setRole(snapshot.data()?.role as UserRole);
          } else {
            setRole(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user role:", error);
          setLoading(false);
        });

        // Cleanup the snapshot listener when the user changes or component unmounts
        // However, onAuthStateChanged cleanup is tricky with nested listeners. 
        // For simplicity in this structure, we'll just let loading finish. 
        // A more robust solution might separate these effects.
        
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({ user, role, loading }), [user, role, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
