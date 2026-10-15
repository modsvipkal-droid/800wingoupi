"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

let clientApp: FirebaseApp | null = null;
let clientAuth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let initPromise: Promise<{ auth: Auth; googleProvider: GoogleAuthProvider }> | null = null;

export function getLoadedClientAuth(): { auth: Auth; googleProvider: GoogleAuthProvider } | null {
  if (clientAuth && googleProvider) {
    return { auth: clientAuth, googleProvider };
  }
  return null;
}

export async function getClientAuth(): Promise<{ auth: Auth; googleProvider: GoogleAuthProvider }> {
  if (clientAuth && googleProvider) {
    return { auth: clientAuth, googleProvider };
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    // Fetch the configuration dynamically from the server route so no keys are hardcoded in source files
    const res = await fetch("/api/auth/config", { cache: "force-cache" });
    if (!res.ok) {
      throw new Error("Failed to load authentication configuration from server");
    }

    const config = await res.json();

    if (getApps().length > 0) {
      clientApp = getApp();
    } else {
      clientApp = initializeApp(config);
    }

    clientAuth = getAuth(clientApp);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });

    return { auth: clientAuth, googleProvider };
  })();

  return initPromise;
}

