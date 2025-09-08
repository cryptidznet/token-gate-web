"use client";

import Image from "next/image";
import PrimaryButton from "./PrimaryButton";
import { IMAGES } from "@/app/assets/images";

export default function InvalidAccessPage() {
  return (
    <main className="min-h-screen bg-cryptidz-palatinate-blue text-cryptidz-white flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center">
          <Image
            src={IMAGES.DRUNK_MONSTER_VERIFYING}
            alt="Drunk Monster With Magnifying Glass"
            width={500}
            height={500}
            quality={100}
            priority={true}
            className="w-64 h-64 xs:w-72 xs:h-72 sm:w-96 sm:h-96 md:w-[480px] md:h-[480px] lg:w-[560px] lg:h-[560px] object-contain"
          />
        </div>

        <p className="font-heading text-cryptidz-white text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl uppercase mb-2 leading-normal md:leading-10 relative -top-6 sm:-top-10 md:-top-12">
          Hmm... yer not supposed to be here, MATEY. <br /> Head to the pub and we&apos;ll get ye sorted proper.
        </p>

        <PrimaryButton onClick={() => {
          window.location.href = "https://t.me/CryptidzTokenGateBot";
        }} iconSrc="/ic_telegram.svg" iconAlt="Telegram">
          Open token gate bot
        </PrimaryButton>
      </div>
    </main>
  );
}


