## Cryptidz Token‑Gate Web 🔐

Welcome! This repository contains the public web client used to verify $CRYPTIDZ token ownership and grant access to private Telegram communities. It’s published for transparency and educational purposes so you can see how the parts fit together. Contributions and PRs are not accepted because this client requires the private Cryptidz backend and operational secrets to function.

### What’s inside at a glance
- **Next.js (App Router)**: Server and client components with route handlers.
- **TypeScript + Zod**: Strict types and runtime validation for responses.
- **Wallet adapters**: Phantom, Solflare, and WalletConnect.
- **Token‑gate flow**: Client hook that drives the UI state machine for connect → sign → verify → success.
- **API proxy**: Route handler forwards signed requests to the private Cryptidz API.
- **Security headers**: Tight Content‑Security‑Policy and robots directives.

### High‑level flow 🧭
1. A user arrives via a Telegram link that includes a `session-token` query param.
2. The server component in `app/page.tsx` validates the `session-token` with the Cryptidz API.
3. If valid, the client UI renders and prompts the user to connect a wallet.
4. The user signs a message containing the `session-token`.
5. The client sends the wallet address, message, and signature to `app/api/token-gate/verify`.
6. The route handler attaches an HMAC bearer token and forwards the request to the Cryptidz API.
7. The API responds with success (and an invite link) or a structured failure code; the UI maps this to friendly copy and actions.

### Key files and how they connect 🧩
- `app/page.tsx`
  - Server component entry. Extracts `session-token`, calls `validateSessionToken`, renders the main UI or `InvalidAccessPage`.
- `libs/token-gate/sessionTokens.ts`
  - Server‑only helper. Validates `session-token` by calling the private API with a signed bearer token.
- `libs/authenticate.ts`
  - Generates HMAC bearer tokens (`GATE:<timestamp>:<signature>`) using `env.API_SECRET`. Used by server calls and API routes.
- `app/api/token-gate/verify/route.ts`
  - API route. Proxies client verification requests to the Cryptidz API with `Authorization: Bearer <token>`.
- `components/home/Home.tsx`
  - Client page UI. Renders background, character art, dialogue box, and CTA box; wires into the token‑gate flow hook.
- `app/features/token-gate/useTokenGateFlow.ts`
  - The state machine for the user journey: idle → connected → verifying → rules → success | error. Handles wallet connect, message signing, calling the verify API, and mapping responses to dialogue + CTAs.
- `app/features/token-gate/errorMap.ts`
  - Maps backend error codes to user‑facing copy, CTAs, and character art.
- `app/features/token-gate/types.ts`
  - Zod schemas and helpers for parsing success/failure `ServiceResponse` shapes from the API.
- `components/WalletAdapterProvider.tsx`
  - Sets up Solana wallet adapters (WalletConnect, Phantom, Solflare, Solana Mobile) and modal UI.
- `components/InvalidAccessPage.tsx`
  - Shown when `session-token` is absent/invalid; guides the user back to the Telegram bot.
- `app/layout.tsx`
  - Global providers (wallet adapters, toasts), fonts, and non‑indexable metadata.
- `next.config.ts`
  - Content‑Security‑Policy and `X‑Robots‑Tag` headers; connects to RPCs and wallet services.
- `env.js`
  - Strict environment schema using `@t3-oss/env-nextjs`. Validates server and client env vars at build/runtime.
- `common.ts`
  - `ServiceResponse<T>` type used across the codebase.

### Environment and configuration 🔧
This client won’t function without the private Cryptidz server. For transparency, here are the expected variables (validated in `env.js`):
- Server‑side:
  - `API_SECRET`: HMAC key for internal bearer token generation.
  - `NODE_ENV`: `development | test | production`.
- Client‑side (`NEXT_PUBLIC_*`):
  - `NEXT_PUBLIC_API_BASE_URL`: Base URL of the Cryptidz API.
  - `NEXT_PUBLIC_CRYPTIDZ_CONTRACT_ADDRESS`: Cryptidz's official contract address
  - `NEXT_PUBLIC_SOLANA_RPC_URL`: Solana RPC endpoint.
  - `NEXT_PUBLIC_GOLD_TIER_MIN_REQUIREMENT`, `NEXT_PUBLIC_PURPLE_TIER_MIN_REQUIREMENT`: Tier thresholds used in UI copy.
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: For WalletConnect adapter.

### Request lifecycle 📬
- Server validation: `app/page.tsx` → `libs/token-gate/sessionTokens.ts` → Cryptidz API (`GET /token-gate/session-tokens/:token`).
- Client verification: `useTokenGateFlow.startVerifyingFlow()` → `app/api/token-gate/verify` → Cryptidz API (`POST /token-gate/verify`).
- Response parsing: `types.ts` parses `ServiceResponse` success/failure; `errorMap.ts` transforms errors to UX.

### Security and stability 🛡️
- **HMAC bearer tokens**: All server‑side calls are signed with `API_SECRET` (never exposed to the client).
- **CSP**: Strict `Content-Security-Policy` (see `next.config.ts`) limiting script, frame, image, and connect sources.
- **Robots**: Explicitly disallows indexing/caching; see `layout.tsx` metadata and `X‑Robots‑Tag` header.
- **Server‑only boundaries**: Token validation and HMAC generation live in server modules only (`import "server-only"`).

### Can I run this locally? 🧪
Short answer: **not effectively**. This client depends on the private Cryptidz backend, production‑grade configuration, and secrets that aren’t included here. We publish this code for transparency and learning, not as a standalone app.

### Can I contribute? 🙏
We appreciate the interest, but we’re not accepting external contributions or PRs. If you have questions or suggestions, feel free to open an issue or email `tech@cryptidz.xyz`.

### Suggested reading order 📚
1. `app/page.tsx` — how `session-token` is validated on the server.
2. `libs/authenticate.ts` and `libs/token-gate/sessionTokens.ts` — HMAC tokens and API calls.
3. `app/features/token-gate/useTokenGateFlow.ts` — the client flow/state machine.
4. `app/features/token-gate/types.ts` and `errorMap.ts` — response schemas and UX mapping.
5. `components/home/Home.tsx` — how the UI is composed.
6. `app/api/token-gate/verify/route.ts` — the API proxy.
7. `next.config.ts` — security headers and CSP.

### License 📄
MIT. See `LICENSE` for details.
