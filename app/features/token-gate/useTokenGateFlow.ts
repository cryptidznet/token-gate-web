"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import { CtaOption } from "@/components/CtaBox";
import type { DialogueSegment } from "@/components/DialogueBox";
import { mapVerifyError } from "./errorMap";
import {
  ServiceResponse,
  VerifyFailureObject,
  isServiceResponse,
  TokenGateWalletModel,
  TokenGateVerifySuccessSchema,
  parseServiceResponseSuccess,
} from "./types";
import { env } from "@/env";

export type UiMode = "idle" | "connected" | "verifying" | "rules" | "success" | "error";

export function useTokenGateFlow(passedSessionToken?: string | null) {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const searchParams = useSearchParams();
  const sessionTokenFromUrl = searchParams.get("session-token");
  const sessionToken = (typeof passedSessionToken === "string" && passedSessionToken.length >= 10)
    ? passedSessionToken
    : (sessionTokenFromUrl && sessionTokenFromUrl.length >= 10 ? sessionTokenFromUrl : null);

  const [uiMode, setUiMode] = useState<UiMode>("idle");
  const [segments, setSegments] = useState<DialogueSegment[]>([]);
  const [ctaOptions, setCtaOptions] = useState<CtaOption[]>([]);
  const [showCta, setShowCta] = useState(false);
  const [characterImage, setCharacterImage] = useState<string>("/img_drunk_monster_default.webp");
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [recoverOnConnect, setRecoverOnConnect] = useState<boolean>(false);
  const [hasDisconnectedOnce, setHasDisconnectedOnce] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const telegramUrl = useMemo(() => "https://t.me/CryptidzTokenGateBot", []);

  useEffect(() => {
    // Only auto-recover from errors when explicitly allowed
    if (uiMode === "verifying" || uiMode === "success" || uiMode === "rules") return;
    if (uiMode === "error" && !recoverOnConnect) return;
    if (connected) {
      setConnectedFlow();
    } else {
      setIdleFlow(hasDisconnectedOnce ? "disconnect" : "initial");
    }
  }, [connected, hasDisconnectedOnce, uiMode, recoverOnConnect]);

  useEffect(() => {
    function onWalletError(e: Event) {
      const anyEvt = e as CustomEvent<{ name?: string; message?: string }>;
      const errorName = (anyEvt?.detail?.name || "").toString();

      let copy = "Hmmm... that doesn't look right. Wanna try again, matey?";
      let ctas = [
        { id: "connect", label: "Connect Wallet" },
        { id: "back", label: "Back to Telegram" },
      ];

      switch (errorName) {
        case "WalletConnectionError":
        case "WalletWindowClosedError":
        case "WalletWindowBlockedError":
          copy = "Ready when ye are, matey.";
          break;
        default:
          break;
      }

      setErrorFlow([copy], ctas, { recoverOnConnect: false });
    }
    window.addEventListener("wallet-adapter-error", onWalletError as EventListener);
    function onWalletConnected(e: Event) {
      const anyEvt = e as CustomEvent<{ walletName?: string; publicKey?: string }>;
      if (uiMode !== "verifying" && uiMode !== "success" && uiMode !== "rules") {
        setConnectedFlow();
      }
    }
    window.addEventListener("wallet-adapter-connected", onWalletConnected as EventListener);
    return () => {
      window.removeEventListener("wallet-adapter-error", onWalletError as EventListener);
      window.removeEventListener("wallet-adapter-connected", onWalletConnected as EventListener);
    };
  }, []);

  function setIdleFlow(mode: "initial" | "disconnect" = "initial") {
    setUiMode("idle");
    if (mode === "initial") {
      setCharacterImage("/img_drunk_monster_welcome.webp");
    } else {
      setCharacterImage("/img_drunk_monster_default.webp");
    }
    if (mode === "initial") {
      setSegments([
        "Ahoy there, matey! Let's get ye verified, shall we?",
        "The process is simple - just show me yer wallet and I'll take care of the rest.",
        "Quick verification and you'll be on yer way to exploring the Swamp!",
        "Ready when ye are, matey...",
      ]);
    } else {
      setSegments(["Ready when ye are, matey..."]);
    }
    setCtaOptions([
      { id: "connect", label: "Connect Wallet" },
      { id: "back", label: "Back to Telegram" },
    ]);
    setShowCta(false);
  }

  function setConnectedFlow() {
    setUiMode("connected");
    setCharacterImage("/img_drunk_monster_default.webp");
    setSegments([
      "Ahhh... I can see yer wallet clear as day!",
      "Time to see what $CRYPTIDZ treasures ye be holdin. Ready to prove yer worth, matey?"
    ]);
    setCtaOptions([
      { id: "verify", label: "Verify Ownership" },
      { id: "disconnect", label: "Disconnect" },
    ]);
    setShowCta(false);
  }

  async function startVerifyingFlow() {
    if (!publicKey || !sessionToken || !signMessage) {
      toast.error("Wallet not connected or signing not supported.");
      return;
    }
    setUiMode("verifying");
    setCharacterImage("/img_drunk_monster_verifying.webp");
    setSegments(["Checkin' your wallet through me spyglass..."]);
    setCtaOptions([]);
    setShowCta(false);
    setLoading(true);

    try {
      new PublicKey(publicKey.toBase58());

      const message = new TextEncoder().encode(`Verify your Cryptidz ownership`);
      const signature = await signMessage(message);

      const response = await fetch(`/api/token-gate/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          sessionToken,
          signature: Array.from(signature),
          message: Array.from(message),
        }),
      });

      const raw = await response.json().catch(() => ({}));
      const successParsed = parseServiceResponseSuccess(raw, TokenGateVerifySuccessSchema);
      if (successParsed.success) {
        const parsed = successParsed.data.responseObject as { tokenGateWallet?: TokenGateWalletModel; inviteLink?: string };
        const { tokenGateWallet, inviteLink } = parsed;
        setInviteUrl(typeof inviteLink === "string" ? inviteLink : null);
        const tier = tokenGateWallet?.tier as string | undefined;
        setRulesFlow(typeof tier === "string" ? tier : undefined);
      } else {
        if (isServiceResponse<any>(raw)) {
          const mapped = mapVerifyError(raw as ServiceResponse<VerifyFailureObject>);
          setErrorFlow(mapped.messageSegments, mapped.ctas, { recoverOnConnect: false }, mapped.overrideCharacterImage);
          setLastError(`${(raw as ServiceResponse<any>).statusCode}: ${(raw as ServiceResponse<any>).message}`);
        } else {
          const msg = typeof (raw as any)?.message === "string" ? (raw as any).message : "Verification failed.";
          setErrorFlow(["Arrr... Let's try that again, matey. Not to worry, me apologies for the inconvenience."], undefined, { recoverOnConnect: false });
          setLastError(String(msg));
        }
      }
    } catch (err) {
      setErrorFlow(["Hmmmm... something ain't right. Let's try again, matey."], undefined, undefined, "/img_drunk_monster_verifying.webp");
    } finally {
      setLoading(false);
    }
  }

  function setRulesFlow(tier?: string) {
    setUiMode("rules");
    setCharacterImage("/img_drunk_monster_default.webp");
    setSegments([
      "Alright, matey - just a couple quick reminders before we celebrate...",
      "First things first - always keep yer Cryptidz balance topped up or ye'll be broke and locked out of all the good spots.",
      { text: `This means keeping your balance above ${env.NEXT_PUBLIC_PURPLE_TIER_MIN_REQUIREMENT} $CRYPTIDZ if you are in the Purple tier, and above ${env.NEXT_PUBLIC_GOLD_TIER_MIN_REQUIREMENT} $CRYPTIDZ if you are in the Gold tier.`, italic: true },
      "And another thing...",
      "Make sure to follow the rules of The Swamp, savvy?",
    ]);
    setCtaOptions([
      { id: "agree_rules", label: "Aye aye captain!" },
    ]);
    setShowCta(false);
  }

  function setSuccessFlow() {
    setUiMode("success");
    setCharacterImage("/img_drunk_monster_celebrating.webp");
    if (inviteUrl) {
      setSegments([
        "🍺 WELCOME ABOARD, YE FINE SEA DOG! All of The Swamp awaits yer adventures!",
        "Now if ye'll excuse me, I've got a date with me bottle! *hiccup* Welcome to the crew, ye magnificent beast!",
      ]);
      setCtaOptions([{ id: "open_invite", label: "Access My Group" }]);
    } else {
      setSegments([
        "Hmmmm... It seems me spyglass ain't workin' right. Let's try that again, matey. Me apologies for the inconvenience.",
        { text: "If this issue persists, please contact support.", italic: true },
      ]);
      setCtaOptions([{ id: "verify", label: "Verify Ownership" }, { id: "back", label: "Back to Telegram" }, { id: "contact_support", label: "Contact Support" }]);
    }
    setShowCta(false);
  }


  function setErrorFlow(
    reason: DialogueSegment[],
    overrideCtas?: CtaOption[],
    opts?: { recoverOnConnect?: boolean },
    overrideCharacterImage: string = "/img_drunk_monster_default.webp",
  ) {
    setUiMode("error");
    setCharacterImage(overrideCharacterImage ?? "/img_drunk_monster_default.webp");
    setSegments(Array.isArray(reason) ? reason : [reason]);
    setCtaOptions(
      overrideCtas ?? [
        { id: "verify", label: "Try Again" },
        { id: "disconnect", label: "Disconnect" },
      ]
    );
    setShowCta(false);
    setRecoverOnConnect(!!opts?.recoverOnConnect);
  }

  async function onSelectCta(id: string) {
    setShowCta(false);
    if (id === "connect") {
      setVisible(true);
      return;
    }
    if (id === "back") {
      window.location.href = telegramUrl;
      return;
    }
    if (id === "disconnect") {
      try {
        await disconnect();
      } finally {
        setHasDisconnectedOnce(true);
        setIdleFlow("disconnect");
      }
      return;
    }
    if (id === "verify") {
      await startVerifyingFlow();
      return;
    }
    if (id === "agree_rules") {
      setSuccessFlow();
      return;
    }
    if (id === "open_invite") {
      if (inviteUrl) {
        window.location.href = inviteUrl;
      }
      return;
    }
    if (id === "contact_support") {
      window.location.href = "https://t.me/CryptidzSupportBot";
      return;
    }
    if (id === "captcha") {
      window.location.href = "https://t.me/CryptidzCaptchaBot";
      return;
    }
  }

  function onDialogueDone() {
    if (ctaOptions.length > 0) setShowCta(true);
  }

  return {
    uiMode,
    segments,
    ctaOptions,
    showCta,
    characterImage,
    loading,
    lastError,
    publicKey,
    onSelectCta,
    onDialogueDone,
  } as const;
}
