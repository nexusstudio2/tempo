import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { cognitoConfig, sealShortLivedValue } from "@/lib/server/auth-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { domain, clientId, redirectUri } = cognitoConfig();
    const state = randomBytes(32).toString("base64url");
    const verifier = randomBytes(48).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    const authorization = new URL("/oauth2/authorize", domain);
    authorization.search = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid email profile",
      state,
      code_challenge_method: "S256",
      code_challenge: challenge,
    }).toString();

    const response = NextResponse.redirect(authorization);
    const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 600 };
    response.cookies.set("tempo_oauth_state", sealShortLivedValue(state), cookieOptions);
    response.cookies.set("tempo_oauth_verifier", sealShortLivedValue(verifier), cookieOptions);
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=auth_unavailable", request.url));
  }
}
