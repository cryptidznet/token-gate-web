"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import { CtaOption } from "@/components/CtaBox";
import type { DialogueSegment } from "@/components/DialogueBox";
import { mapVerifyError } from "./errorMap";
import {
  VerifyFailureObject,
  isServiceResponse,
  TokenGateVerifySuccessSchema,
  parseServiceResponseSuccess,
} from "./types";
import { env } from "@/env";
import { ServiceResponse } from "@/common";
import { IMAGES } from "@/app/assets/images";

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
  const [characterImage, setCharacterImage] = useState<string>(IMAGES.DRUNK_MONSTER_DEFAULT);
  const [recoverOnConnect, setRecoverOnConnect] = useState<boolean>(false);
  const [hasDisconnectedOnce, setHasDisconnectedOnce] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const uiModeRef = useRef<UiMode>("idle");
  useEffect(() => { uiModeRef.current = uiMode; }, [uiMode]);
  const recoverOnConnectRef = useRef<boolean>(false);
  useEffect(() => { recoverOnConnectRef.current = recoverOnConnect; }, [recoverOnConnect]);

  const telegramUrl = useMemo(() => "https://t.me/CryptidzTokenGateBot", []);

  useEffect(() => {
    // Only auto-recover from errors when explicitly allowed
    if (uiMode === "verifying" || uiMode === "success" || uiMode === "rules") return;
    if (uiMode === "error" && !recoverOnConnect) return;
    if (connected || publicKey) {
      setConnectedFlow();
    } else {
      setIdleFlow(hasDisconnectedOnce ? "disconnect" : "initial");
    }
  }, [connected, publicKey, hasDisconnectedOnce, uiMode, recoverOnConnect]);

  function setIdleFlow(mode: "initial" | "disconnect" = "initial") {
    setUiMode("idle");
    if (mode === "initial") {
      setCharacterImage(IMAGES.DRUNK_MONSTER_WELCOME);
    } else {
      setCharacterImage(IMAGES.DRUNK_MONSTER_DEFAULT);
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
    setCharacterImage(IMAGES.DRUNK_MONSTER_WELCOME);
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
    setCharacterImage(IMAGES.DRUNK_MONSTER_VERIFYING);
    setSegments(["Checkin' your wallet through me spyglass..."]);
    setCtaOptions([]);
    setShowCta(false);

    try {
      new PublicKey(publicKey.toBase58());

      const message = new TextEncoder().encode(`Verify your Cryptidz ownership: ${sessionToken}`);
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
        const parsed = successParsed.data.responseObject as { inviteLink?: string };
        const { inviteLink } = parsed;
        setInviteUrl(typeof inviteLink === "string" ? inviteLink : null);
        setRulesFlow();
      } else {
        if (isServiceResponse<Record<string, unknown>>(raw)) {
          const mapped = mapVerifyError(raw as ServiceResponse<VerifyFailureObject>);
          setErrorFlow(mapped.messageSegments, mapped.ctas, { recoverOnConnect: false }, mapped.overrideCharacterImage);
        } else {
          setErrorFlow(["Arrr... Let's try that again, matey. Not to worry, me apologies for the inconvenience."], undefined, { recoverOnConnect: false });
        }
      }
    } catch (err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setErrorFlow(["Hmmmm... something ain't right. Let's try again, matey."], undefined, undefined, IMAGES.DRUNK_MONSTER_VERIFYING);
    }
  }

  function setRulesFlow() {
    setUiMode("rules");
    setCharacterImage(IMAGES.DRUNK_MONSTER_DEFAULT);
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
    setCharacterImage(IMAGES.DRUNK_MONSTER_CELEBRATING);
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
    overrideCharacterImage: string = IMAGES.DRUNK_MONSTER_DEFAULT,
  ) {
    setUiMode("error");
    setCharacterImage(overrideCharacterImage ?? IMAGES.DRUNK_MONSTER_DEFAULT);
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
        try {
          await disconnect();
        } finally {
          window.location.href = inviteUrl;
        }
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
    if (id === "buy-cryptidz") {
      window.open(
        `https://jup.ag/swap?sell=So11111111111111111111111111111111111111112&buy=${env.NEXT_PUBLIC_CRYPTIDZ_CONTRACT_ADDRESS}`,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }
  }

  function onDialogueDone() {
    if (ctaOptions.length > 0) setShowCta(true);
  }

  return {
    segments,
    ctaOptions,
    showCta,
    characterImage,
    onSelectCta,
    onDialogueDone,
  } as const;
}
