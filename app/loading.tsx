import Image from "next/image";
import { IMAGES } from "./assets/images";

export default function Loading() {
  return (
    <main className="min-h-screen bg-cryptidz-palatinate-blue text-cryptidz-white flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center">
          <Image
            src={IMAGES.DRUNK_MONSTER_SLEEPING}
            alt="Drunk Monster Sleeping"
            width={400}
            height={400}
            quality={100}
            priority={true}
            className="w-64 h-64 sm:w-72 sm:h-72 md:w-[480px] md:h-[480px] lg:w-[560px] lg:h-[560px] object-contain"
          />
        </div>

        <h1 className="font-heading text-cryptidz-lavender text-stroke-white text-stroke-responsive uppercase mb-2 leading-none text-[clamp(3rem,7vw,6.5rem)] lg:text-[clamp(3.5rem,8vw,7.5rem)] [--webkit-text-stroke:1px] sm:[--webkit-text-stroke:2px] md:[--webkit-text-stroke:2px]">
          Loading ...
        </h1>
      </div>
    </main>
  );
}


