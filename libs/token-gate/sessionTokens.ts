import { isServiceResponse } from "@/app/features/token-gate/types";
import { ServiceResponse } from "@/common";
import { env } from "@/env";
import { generateToken } from "@/libs/authenticate";

export type SessionTokenValidationResult =
  | { isValid: true; model?: unknown }
  | { isValid: false; statusCode: number; message: string; errorCode?: string };

export async function validateSessionToken(sessionToken: string): Promise<SessionTokenValidationResult> {
  try {
    const url = `${env.NEXT_PUBLIC_API_BASE_URL}/token-gate/session-tokens/${encodeURIComponent(sessionToken)}`;
    const bearer = generateToken();
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer}`,
      },
      cache: "no-store",
    });
    const data: unknown = await res.json().catch(() => ({}));

    if (isServiceResponse<any>(data)) {
      const sr = data as ServiceResponse<any>;
      if (sr.success) {
        return { isValid: true, model: sr.responseObject };
      }
      const errorCode: string | undefined = typeof (sr.responseObject as any)?.errorCode === "string" ? (sr.responseObject as any).errorCode : undefined;
      return { isValid: false, statusCode: sr.statusCode, message: sr.message, errorCode };
    }

    if (!res.ok) {
      return { isValid: false, statusCode: res.status, message: "Invalid session token" };
    }

    return { isValid: true };
  } catch (err) {
    return { isValid: false, statusCode: 500, message: "Network error validating session token" };
  }
}


