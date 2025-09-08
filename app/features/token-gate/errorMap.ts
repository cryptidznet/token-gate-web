import { CtaOption } from "@/components/CtaBox";
import { VerifyFailureObject } from "./types";
import { ServiceResponse } from "@/common";

type MessageSegment = string | { text: string; italic?: boolean };

export function mapVerifyError(
  response: ServiceResponse<VerifyFailureObject>
): { messageSegments: MessageSegment[]; ctas: CtaOption[]; overrideCharacterImage?: string } {
  const { responseObject, message, statusCode } = response;
  const errorCode = responseObject?.errorCode ?? "";

  const supportNote: MessageSegment = { text: "If this issue persists, please contact support.", italic: true };
  const defaultCtas: CtaOption[] = [
    { id: "verify", label: "Try Again" },
    { id: "disconnect", label: "Disconnect" },
    { id: "contact_support", label: "Contact Support" },
  ];
  const statusBundle = (base: string) => ({
    messageSegments: [base, supportNote],
    ctas: defaultCtas,
  });

  switch (errorCode) {
    case "INVALID_SESSION_TOKEN":
      return {
        messageSegments: [
          "Hmmm... Something smells fishy here. And trust me, that's not a compliment.",
          { text: "For security, your session has expired. Please return to Telegram and type /verify to get a fresh verification link.", italic: true }
        ],
        ctas: [{ id: "back", label: "Back to Telegram" }],
        overrideCharacterImage: "/img_drunk_monster_verifying.webp",
      };
    case "INVALID_SIGNATURE":
      return {
        messageSegments: [
          "Arr... Me spyglass is having trouble verifying yer Cryptidz holdings. Wanna try that again, matey? Me apologies for the inconvenience.",
          { text: "This means your wallet signature couldn't be validated. Please try connecting and signing again.", italic: true }
        ],
        ctas: [
          { id: "verify", label: "Try Again" },
          { id: "disconnect", label: "Disconnect" },
        ],
      };
    case "USER_NOT_FOUND":
      return {
        messageSegments: [
          "Hmmmm... I spent me entire life explorin' the 207 seas, and trust me I know a fish when I see one.",
          { text: "This means you have not been verified yet. Please return to Telegram and complete the captcha verification first.", italic: true },
          { text: "If you think this is an error, please contact support instead.", italic: true }
        ],
        ctas: [{ id: "captcha", label: "Complete Captcha" }, { id: "contact_support", label: "Contact Support" }],
        overrideCharacterImage: "/img_drunk_monster_verifying.webp",
      };
    case "WALLET_ALREADY_LINKED":
      return {
        messageSegments: [
          "Hold on there, matey... I may have had a drink or two, but I never forget a wallet I've checked. This one belongs to another sailor, if me memory serves me right.",
          { text: "This means the wallet is already linked to a different Telegram account. For security, each wallet can only be linked once.", italic: true },
          { text: "If you need to change which Telegram account this wallet is linked to, please contact the admins for assistance.", italic: true }
        ],
        ctas: [{ id: "disconnect", label: "Disconnect" }, { id: "contact_support", label: "Contact Support" }],
        overrideCharacterImage: "/img_drunk_monster_verifying.webp",
      };
    case "INSUFFICIENT_BALANCE": {
      const current = responseObject?.currentBalance;
      const needPurple = responseObject?.requiredBalancePurple;
      const needGold = responseObject?.requiredBalanceGold;

      const segments: MessageSegment[] = ["Hate to break it to ye, matey, but yer $CRYPTIDZ balance is too low."];

      if (typeof current !== "undefined" && typeof needPurple !== "undefined") {
        segments.push({
          text: `You currently have ${current} $CRYPTIDZ. You need at least ${needPurple} for Purple tier${typeof needGold !== "undefined" ? ` or ${needGold} for Gold tier` : ""}.`,
          italic: true,
        });
        segments.push("Make sure to top up yer balance. I'll be waiting right here when ye are ready, matey.");
      } else {
        segments.push({ text: message, italic: true });
      }

      return {
        messageSegments: segments,
        ctas: [
          { id: "buy-cryptidz", label: "Buy $CRYPTIDZ" },
          { id: "verify", label: "Try Again" },
          { id: "disconnect", label: "Disconnect" },
          { id: "contact_support", label: "Contact Support" },
        ],
        overrideCharacterImage: "/img_drunk_monster_frowning.webp",
      };
    }
    default: {
      if (statusCode === 400 || statusCode === 422) {
        return statusBundle("Seems me spyglass is having trouble verifying yer Cryptidz holdings. Wanna try that again, matey? Me apologies for the inconvenience.");
      } else if (statusCode === 401 || statusCode === 403) {
        return statusBundle("Having trouble on me end. Wanna try again, matey? Me apologies for the inconvenience.");
      } else if (statusCode === 404 || statusCode >= 500) {
        return {
          messageSegments: ["Well this is embarrassing, but me spyglass just snapped. Come back later when I'm back in action, matey. Me apologies for the inconvenience."],
          ctas: [{ id: "back", label: "Back to Telegram" }, { id: "contact_support", label: "Contact Support" }],
          overrideCharacterImage: "/img_drunk_monster_frowning.webp",
        }
      }
      return statusBundle("Something unexpected happened. Wanna try again, matey? Me apologies for the inconvenience.");
    }
  }
}
