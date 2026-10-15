"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { getClientAuth, getLoadedClientAuth } from "../utils/firebaseClient";

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithGoogle: (turnstileToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync session with server and Firebase auth state
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        // 1. First check if server has an active session cookie
        const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData.authenticated && sessionData.user && isMounted) {
            setUser(sessionData.user);
          }
        }

        // 2. Initialize client Firebase auth & check redirect results or auth listener
        const { auth } = await getClientAuth();

        // Check if user was redirected from Google sign-in
        const redirectRes = await getRedirectResult(auth).catch(() => null);
        if (redirectRes?.user && isMounted) {
          let savedToken: string | undefined = undefined;
          try {
            savedToken = sessionStorage.getItem("wingo_turnstile_token") || undefined;
            sessionStorage.removeItem("wingo_turnstile_token");
          } catch (e) {}
          await syncUserWithServer(redirectRes.user, savedToken).catch((err) => {
            console.warn("Redirect server sync notice:", err);
          });
        }

        // Real-time listener for client-side Firebase Auth changes
        onAuthStateChanged(auth, async (fbUser) => {
          if (!isMounted) return;
          if (fbUser) {
            // Only sync if user was not already restored from active session
            setUser((currentUser) => {
              if (!currentUser) {
                syncUserWithServer(fbUser).catch(() => {});
              }
              return currentUser;
            });
          }
        });
      } catch (err) {
        console.warn("Auth initialization notice:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const syncUserWithServer = async (fbUser: FirebaseUser, turnstileToken?: string) => {
    const realUserData: AuthUser = {
      uid: fbUser.uid,
      displayName: fbUser.displayName || null,
      email: fbUser.email || null,
      photoURL: fbUser.photoURL || null,
      emailVerified: fbUser.emailVerified,
    };

    const idToken = await fbUser.getIdToken();
    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: idToken,
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
        turnstileToken,
      }),
    });

    const data = await loginRes.json().catch(() => ({}));
    if (!loginRes.ok || !data.success) {
      throw new Error(data.message || "Failed to authenticate session with server.");
    }

    setUser(realUserData);
  };

  const openLoginModal = () => {
    setAuthError(null);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setAuthError(null);
  };

  const loginWithGoogle = async (turnstileToken?: string) => {
    setAuthError(null);
    setIsLoggingIn(true);

    try {
      const loaded = getLoadedClientAuth();
      const { auth, googleProvider } = loaded || (await getClientAuth());

      try {
        // Trigger real Google account selection popup (synchronous gesture preservation)
        const result = await signInWithPopup(auth, googleProvider);
        if (result?.user) {
          await syncUserWithServer(result.user, turnstileToken);
          setIsLoginModalOpen(false);
        }
      } catch (popupError: any) {
        // If popup was blocked by browser
        if (
          popupError?.code === "auth/popup-blocked" ||
          popupError?.code === "auth/cancelled-popup-request"
        ) {
          console.warn("Popup blocked by browser:", popupError);
          setAuthError(
            "Google sign-in popup was blocked by your browser. Please allow popups for this site and try again."
          );
          return;
        }

        if (popupError?.code === "auth/popup-closed-by-user") {
          setAuthError("Google sign-in was cancelled. Please try again.");
          return;
        }

        if (popupError?.code === "auth/unauthorized-domain") {
          setAuthError(
            "This domain is not authorized in Firebase Console. Please add your current domain to Authorized Domains in Firebase Authentication settings."
          );
          return;
        }

        throw popupError;
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      try {
        const { auth } = await getClientAuth().catch(() => ({ auth: null }));
        if (auth) {
          await firebaseSignOut(auth).catch(() => {});
        }
      } catch (e) {}
      setUser(null);
      setAuthError(error?.message || "Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      const { auth } = await getClientAuth().catch(() => ({ auth: null }));
      if (auth) {
        await firebaseSignOut(auth).catch(() => {});
      }
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        loginWithGoogle,
        logout,
        authError,
        setAuthError,
        isLoggingIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
