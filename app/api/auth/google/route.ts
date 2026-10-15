import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/app/utils/firebase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || null;
    const name = searchParams.get("name") || null;

    const userData = {
      uid: "google_" + Math.random().toString(36).substring(2, 10),
      displayName: name,
      email: email,
      photoURL: searchParams.get("photoURL") || null,
      emailVerified: true,
    };

    const cookieStore = await cookies();
    cookieStore.set("wingo_session", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Successful</title></head>
        <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;">
          <div style="text-align:center;background:#fff;padding:24px;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="color:#10b981;margin:0 0 8px;">Signed in successfully!</h3>
            <p style="color:#64748b;font-size:14px;margin:0;">Closing window...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'AUTH_SUCCESS', user: ${JSON.stringify(userData)} }, '*');
              setTimeout(() => window.close(), 600);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
