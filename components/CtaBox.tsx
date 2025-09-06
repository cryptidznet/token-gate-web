"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type CtaOption = {
  id: string;
  label: string;
};

type CtaBoxProps = {
  options: CtaOption[];
  onSelect: (id: string) => void;
  className?: string;
};

export function CtaBox({ options, onSelect, className }: CtaBoxProps) {
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [arrowTop, setArrowTop] = useState<number>(0);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [options]);

  const handleKey = useCallback(
    (key: string, prevent?: () => void) => {
      if (!options || options.length === 0) return;
      if (key === "ArrowDown") {
        prevent?.();
        setHighlightedIndex((idx) => (idx + 1) % options.length);
      } else if (key === "ArrowUp") {
        prevent?.();
        setHighlightedIndex((idx) => (idx - 1 + options.length) % options.length);
      } else if (key === "Enter") {
        prevent?.();
        const opt = options[highlightedIndex];
        if (opt) onSelect(opt.id);
      }
    },
    [options, highlightedIndex, onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      handleKey(e.key, () => e.preventDefault());
    },
    [handleKey]
  );

  useEffect(() => {
    const onWindowKey = (e: KeyboardEvent) => handleKey(e.key, () => e.preventDefault());
    window.addEventListener("keydown", onWindowKey);
    return () => window.removeEventListener("keydown", onWindowKey);
  }, [handleKey]);

  const updateArrowPosition = useCallback(() => {
    const wrapper = wrapperRef.current;
    const activeItem = itemRefs.current[highlightedIndex];
    if (!wrapper || !activeItem) return;
    const wrapperRect = wrapper.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const middle = itemRect.top - wrapperRect.top + itemRect.height / 2;
    setArrowTop(middle);
  }, [highlightedIndex]);

  useEffect(() => {
    updateArrowPosition();
  }, [highlightedIndex, options, updateArrowPosition]);

  useEffect(() => {
    const onResize = () => updateArrowPosition();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateArrowPosition]);

  if (!options || options.length === 0) return null;
  return (
    <div className={"relative inline-block " + (className ?? "")} ref={wrapperRef} tabIndex={0} role="menu" aria-activedescendant={options[highlightedIndex] ? `cta-${options[highlightedIndex].id}` : undefined} onKeyDown={handleKeyDown}>
      <div className="absolute -left-6 top-0 z-20 pointer-events-none" style={{ top: arrowTop - 15 }}>
        <Image src="/ic_arrow_right.svg" alt="" width={40} height={40} className="h-8 w-8 motion-safe:animate-[nudge-right_1.2s_ease-in-out_infinite]" />
      </div>

      {/* Options box */}
      <div className="relative z-10 rounded-md bg-cryptidz-white p-2 flex flex-col">
        {options.map((opt, index) => {
          const isActive = index === highlightedIndex;
          return (
            <button
              key={opt.id}
              id={`cta-${opt.id}`}
              role="menuitem"
              ref={(el) => { itemRefs.current[index] = el; }}
              onClick={() => onSelect(opt.id)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={
                "relative w-full h-12 rounded-md transition text-black text-base sm:text-lg md:text-xl lg:text-[24px] font-dialogue outline-none focus:outline-none text-left px-3 whitespace-nowrap cursor-pointer " +
                (isActive ? "bg-cryptidz-soft-lavender" : "bg-transparent hover:bg-cryptidz-soft-lavender")
              }
              aria-selected={isActive}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { CtaOption };


