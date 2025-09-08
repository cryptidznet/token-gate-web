"use client";

import { IMAGES } from "@/app/assets/images";
import Image from "next/image";

export function HeaderControls() {
  return (
    <>
      <div className="fixed top-4 left-4 z-50 rounded-md overflow-hidden">
        <Image src={IMAGES.LOGO} alt="Cryptidz logo" width={160} height={48} className="h-8 w-auto" priority />
      </div>
      <a
        href="https://github.com/cryptidznet/token-gate-web"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open GitHub repository"
        className="fixed top-4 right-4 z-50 text-white/80 hover:text-white transition-colors"
      >
        <Image src="/ic_github.svg" alt="GitHub" width={32} height={32} />
      </a>
    </>
  );
}


