import { ServiceResponse } from "@/common";
import { z } from "zod";
export type TokenGateErrorCode =
  | "INVALID_SESSION_TOKEN"
  | "INVALID_SIGNATURE"
  | "USER_NOT_FOUND"
  | "INSUFFICIENT_BALANCE"
  | "INTERNAL_SERVER_ERROR"
  | string;

export type VerifyFailureObject = {
  errorCode: TokenGateErrorCode;
  currentBalance?: number;
  requiredBalancePurple?: number;
  requiredBalanceGold?: number;
};

export function isServiceResponse<T extends object>(value: unknown): value is ServiceResponse<T> {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.success === "boolean" &&
    typeof v.message === "string" &&
    typeof v.statusCode === "number"
  );
}

export type TokenGateTier = "purple" | "gold" | string;
export type TokenGateWalletModel = {
  _id: string;
  userId: string;
  userTelegramId: string;
  createdAt: string | Date;
  tier?: TokenGateTier;
  userOwnerAccountAddress?: string;
  userTokenAccountAddress?: string;
  userTokenBalance?: number;
  userTokenBalanceUiFormatted?: string;
  updatedAt?: string | Date;
};

// Zod schemas for strict parsing
const TierNormalizedSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.toLowerCase() : v),
  z.union([z.literal("purple"), z.literal("gold")])
).optional();

export const TokenGateWalletSchema = z
  .object({
    tier: TierNormalizedSchema,
  })
  .passthrough();

const TelegramInviteLinkSchema = z.string().url().refine((value) => {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (!['t.me', 'telegram.me', 'tg.me'].includes(host)) return false;
    const path = url.pathname;
    // Accept t.me/+<code> or t.me/joinchat/<code>
    return (/^\/\+[A-Za-z0-9_-]+$/.test(path) || /^\/joinchat\/[A-Za-z0-9_-]+$/.test(path));
  } catch {
    return false;
  }
}, { message: 'Invalid Telegram invite link' });

export const TokenGateVerifySuccessSchema = z.object({
  tokenGateWallet: TokenGateWalletSchema,
  inviteLink: TelegramInviteLinkSchema,
});

export const VerifyFailureObjectSchema = z.object({
  errorCode: z.string(),
  currentBalance: z.number().optional(),
  requiredBalancePurple: z.number().optional(),
  requiredBalanceGold: z.number().optional(),
});

export function parseServiceResponseSuccess<T extends z.ZodTypeAny>(value: unknown, schema: T) {
  const base = z.object({ success: z.literal(true), message: z.string(), responseObject: schema, statusCode: z.number() });
  return base.safeParse(value);
}

export function parseServiceResponseFailure<T extends z.ZodTypeAny>(value: unknown, schema: T) {
  const base = z.object({ success: z.literal(false), message: z.string(), responseObject: schema.optional(), statusCode: z.number() });
  return base.safeParse(value);
}


