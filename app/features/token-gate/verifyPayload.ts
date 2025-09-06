export type VerificationPayload = {
  type: "cryptidz-token-gate-verify";
  domain: string;
  uri: string;
  walletAddress: string;
  sessionToken: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
  statement: string;
};

function generateNonce(bytes: number = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function buildVerificationPayload(params: {
  domain: string;
  uri: string;
  walletAddress: string;
  sessionToken: string;
  ttlMs?: number; // default 5 minutes
}): { payload: VerificationPayload; messageBytes: Uint8Array } {
  const { domain, uri, walletAddress, sessionToken, ttlMs = 5 * 60 * 1000 } = params;

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + ttlMs);

  const payload: VerificationPayload = {
    type: "cryptidz-token-gate-verify",
    domain,
    uri,
    walletAddress,
    sessionToken,
    nonce: generateNonce(16),
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    statement: "Verify your Cryptidz ownership",
  };

  const messageBytes = new TextEncoder().encode(JSON.stringify(payload));
  return { payload, messageBytes };
}


