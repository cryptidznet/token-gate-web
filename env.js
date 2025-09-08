import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify all server-side environment variables schema here. This way we can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    API_SECRET: z.string(),
    NODE_ENV: z.enum(["development", "test", "production"]),
  },

  /**
   * Specify all client-side environment variables schema here. This way we can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_SOLANA_RPC_URL: z.string().url(),
    NEXT_PUBLIC_API_BASE_URL: z.string().url(),
    NEXT_PUBLIC_ASSETS_BASE_URL: z.string().url(),
    NEXT_PUBLIC_CRYPTIDZ_CONTRACT_ADDRESS: z.string(),
    NEXT_PUBLIC_GOLD_TIER_MIN_REQUIREMENT: z.coerce.number(),
    NEXT_PUBLIC_PURPLE_TIER_MIN_REQUIREMENT: z.coerce.number(),
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    API_SECRET: process.env.API_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CRYPTIDZ_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CRYPTIDZ_CONTRACT_ADDRESS,
    NEXT_PUBLIC_GOLD_TIER_MIN_REQUIREMENT: process.env.NEXT_PUBLIC_GOLD_TIER_MIN_REQUIREMENT,
    NEXT_PUBLIC_PURPLE_TIER_MIN_REQUIREMENT: process.env.NEXT_PUBLIC_PURPLE_TIER_MIN_REQUIREMENT,
    NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_ASSETS_BASE_URL: process.env.NEXT_PUBLIC_ASSETS_BASE_URL,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. 
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
