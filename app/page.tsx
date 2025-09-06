"use client";

import { Suspense } from "react";
import Image from "next/image";
import { Loader2, AlertCircle } from "lucide-react";
import { DialogueBox } from "@/components/DialogueBox";
import { CtaBox } from "@/components/CtaBox";
import { useTokenGateFlow } from "./features/token-gate/useTokenGateFlow";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const {
    uiMode,
    segments,
    ctaOptions,
    showCta,
    characterImage,
    loading,
    publicKey,
    onSelectCta,
    onDialogueDone,
  } = useTokenGateFlow();

  const searchParams = useSearchParams();
  const sessionTokenParam = searchParams.get("session-token");
  const sessionToken = sessionTokenParam && sessionTokenParam.length >= 10 ? sessionTokenParam : null;

  if (!sessionToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-lg font-semibold text-black">Invalid Access</p>
          <p className="text-gray-600 mt-2">Please use the verification link provided in Telegram.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-stretch justify-center bg-black">
      <div className="relative w-full flex-1 overflow-x-hidden">
        <picture className="absolute inset-0">
          <source media="(min-width: 768px)" srcSet="/img_horn_pub.jpg" />
          <Image src="/img_horn_pub_portrait.jpg" alt="Horn Pub" fill priority className="object-cover object-center blur-[2px]" />
        </picture>
        <div className="tg-crt" />
        <div className="relative z-10 flex flex-col justify-end min-h-screen px-4 py-4">
          <div className="w-full flex-1" />

          <div className="absolute left-1/2 -translate-x-1/2 bottom-28 sm:bottom-40 md:bottom-0 w-full z-10 pointer-events-none flex items-end justify-center">
            <div className="relative w-full aspect-square max-w-[360px] xs:max-w-[440px] sm:max-w-[720px] md:max-w-[960px] lg:max-w-[1240px]">
              <Image src={characterImage} alt="Character" fill priority quality={100} className="object-contain object-bottom" />
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[92%] z-20 flex flex-col items-center pb-4 sm:pb-16">
            <div className="w-full max-w-[720px] flex flex-col items-stretch gap-3 sm:gap-6">
              {showCta ? <CtaBox options={ctaOptions} onSelect={onSelectCta} className="w-auto inline-flex self-end md:translate-x-1/2" /> : null}
              <div className="w-full tg-dialogue">
                <DialogueBox segments={segments} onAllSegmentsDone={onDialogueDone} label="Sol D Groger" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
            <Loader2 className="mx-auto mb-4 animate-spin text-blue-500" size={48} />
            <p className="text-lg font-semibold text-black">Loading...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
