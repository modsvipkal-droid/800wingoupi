import { NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/app/utils/turnstile";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token } = body;

    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
    const result = await verifyTurnstileToken(token, clientIp);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Turnstile verification failed.",
          errorCodes: result.errorCodes,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Turnstile verification successful.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server verification error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
