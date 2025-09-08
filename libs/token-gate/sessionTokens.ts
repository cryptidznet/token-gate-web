import "server-only";
import { isServiceResponse } from "@/app/features/token-gate/types";
import { ServiceResponse } from "@/common";
import { env } from "@/env";
import { generateToken } from "@/libs/authenticate";

export async function validateSessionToken(sessionToken: string): Promise<boolean> {
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

    if (!res.ok) {
      return false;
    }

    const data: unknown = await res.json().catch(() => undefined);

    if (isServiceResponse<Record<string, unknown>>(data)) {
      const sr = data as ServiceResponse<Record<string, unknown>>;
      if (sr.success) {
        return true;
      }
      return false;
    }

    return false;
  } catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return false;
  }
}


