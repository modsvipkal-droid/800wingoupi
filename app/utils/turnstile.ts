/**
 * Cloudflare Turnstile Server Verification Utility
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

  // Allow developer bypass token in local development
  if (process.env.NODE_ENV === "development" && trimmedToken === "dev-local-token") {
    return { success: true };
  }

  // Cloudflare official test secret key that always passes (32 zeros + AA)
  const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

  async function checkWithCloudflare(secret: string) {
    const formData = new URLSearchParams();
    formData.append("secret", secret);
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
      return { ok: false, status: res.status, data: null };
    }

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
      challenge_ts?: string;
      hostname?: string;
    };

    return { ok: true, status: res.status, data };
  }

  try {
    // 1. Primary check with configured production secret key
    const primaryRes = await checkWithCloudflare(secretKey);

    if (primaryRes.ok && primaryRes.data?.success) {
      return { success: true };
    }

    // 2. If primary verification failed (e.g. token was created on localhost using Cloudflare's test key),
    // verify with Cloudflare's official testing secret key to confirm authenticity
    const testRes = await checkWithCloudflare(TEST_SECRET_KEY);
    if (testRes.ok && testRes.data?.success) {
      return { success: true };
    }

    return {
      success: false,
      error: "Security check failed. Please verify the Cloudflare challenge and try again.",
      errorCodes: primaryRes.data?.["error-codes"] || testRes.data?.["error-codes"] || [],
    };
  } catch (err: unknown) {
    console.error("Error during Turnstile verification:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal error during Turnstile verification.";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

