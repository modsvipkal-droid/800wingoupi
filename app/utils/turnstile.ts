/**
 * Cloudflare Turnstile Server Verification Utility (Production)
 */
export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string
): Promise<{ success: boolean; error?: string; errorCodes?: string[] }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not defined in environment variables");
    return { success: false, error: "Server security configuration is missing." };
  }

  if (!token || typeof token !== "string" || !token.trim()) {
    return { success: false, error: "Cloudflare Turnstile verification token is required." };
  }

  const trimmedToken = token.trim();

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", trimmedToken);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!res.ok) {
      return {
        success: false,
        error: `Cloudflare verification failed with status ${res.status}.`,
      };
    }

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
      challenge_ts?: string;
      hostname?: string;
    };

    if (!data.success) {
      return {
        success: false,
        error: "Security verification failed. Please complete the Cloudflare check again.",
        errorCodes: data["error-codes"] || [],
      };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Error during Turnstile verification:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Internal error during Turnstile verification.";
    return {
      success: false,
      error: errorMessage,
    };
  }
}


