// ============================================================
// PlanCraft AI — Auth Hook
// ============================================================

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { onAuthChange, signInWithGoogle, signOut } from "@/lib/firebase/auth";
import type { User } from "@/lib/types";

export function useAuth() {
  const { user, loading, setUser, setLoading, clearUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName || "User",
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
        };
        setUser(user);
      } else {
        clearUser();
      }
    });

    return () => unsubscribe();
  }, [setUser, clearUser]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in failed:", error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      clearUser();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return {
    user,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isAuthenticated: !!user,
  };
}
