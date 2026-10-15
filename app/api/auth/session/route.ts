import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("wingo_session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const userData = JSON.parse(sessionCookie.value);
    return NextResponse.json({ authenticated: true, user: userData });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
