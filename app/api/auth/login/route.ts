import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyTurnstileToken } from "@/app/utils/turnstile";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, email, displayName, photoURL, uid, turnstileToken } = body;

    // Check if user already has an active session cookie for this uid (e.g. background session refresh)
    const cookieStore = await cookies();
    const existingSession = cookieStore.get("wingo_session");
    let isExistingSession = false;
    if (existingSession?.value && uid) {
      try {
        const parsed = JSON.parse(existingSession.value);
        if (parsed.uid === uid) {
          isExistingSession = true;
        }
      } catch {
        isExistingSession = false;
      }
    }

    // Strictly verify Turnstile token on the backend server before allowing login
    if (!isExistingSession) {
      const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
      const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIp);

      if (!turnstileResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: turnstileResult.error || "Turnstile security verification failed. Please try again.",
            errorCodes: turnstileResult.errorCodes,
          },
          { status: 403 }
        );
      }
    }

    let userData = {
      uid: uid || "user_" + Date.now().toString(36),
      displayName: displayName || null,
      email: email || null,
      photoURL: photoURL || null,
      emailVerified: true,
    };

    // If an ID token was provided, verify with Firebase Identity Toolkit on server
    if (token && process.env.FIREBASE_API_KEY) {
      try {
        const verifyRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token }),
          }
        );
        const verifyData = await verifyRes.json();
        if (verifyData.users && verifyData.users[0]) {
          const u = verifyData.users[0];
          userData = {
            uid: u.localId,
            displayName: u.displayName || displayName || null,
            email: u.email || email || null,
            photoURL: u.photoUrl || photoURL || null,
            emailVerified: Boolean(u.emailVerified),
          };
        }
      } catch (e) {
        console.warn("Server-side token verification warning:", e);
      }
    }

    cookieStore.set("wingo_session", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true, user: userData });
  } catch (error: unknown) {
    console.error("Login route error:", error);
    const message = error instanceof Error ? error.message : "Internal server authentication error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
