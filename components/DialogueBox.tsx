"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DialogueSegment = string | { text: string; italic?: boolean; bold?: boolean };

type DialogueBoxProps = {
  segments: DialogueSegment[];
  typingSpeedMs?: number;
  onAllSegmentsDone?: () => void;
  className?: string;
  label?: string;
};

export function DialogueBox({ segments, typingSpeedMs = 20, onAllSegmentsDone, className, label }: DialogueBoxProps) {
  const normalizedSegments = useMemo(() => {
    const asObjects = (segments ?? []).map((s) => (typeof s === "string" ? { text: s } : (s || { text: "" })));
    return asObjects.filter((s) => (s.text ?? "").length > 0);
  }, [segments]);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [visibleText, setVisibleText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const current = normalizedSegments[segmentIndex] ?? { text: "" };
  const timerRef = useRef<number | null>(null);

  // Reset typing when segments change identity
  useEffect(() => {
    setSegmentIndex(0);
    setVisibleText("");
    setIsTyping(true);
  }, [normalizedSegments.map((s) => `${s.text}|${s.italic ? 'i' : ''}${s.bold ? 'b' : ''}`).join("|__|")]);

  // Type effect
  useEffect(() => {
    if (!isTyping) return;
    if (!current) {
      setIsTyping(false);
      return;
    }
    let i = visibleText.length;
    if (i >= current.text.length) {
      setIsTyping(false);
      return;
    }
    timerRef.current = window.setInterval(() => {
      i += 1;
      setVisibleText(current.text.slice(0, i));
      if (i >= current.text.length && timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
        setIsTyping(false);
      }
    }, typingSpeedMs);
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, isTyping, typingSpeedMs]);

  // When a segment finishes, if it's the last, notify parent
  useEffect(() => {
    if (!isTyping && visibleText === current.text && segmentIndex === normalizedSegments.length - 1) {
      onAllSegmentsDone?.();
    }
  }, [isTyping, visibleText, current, segmentIndex, normalizedSegments.length, onAllSegmentsDone]);

  const isLastSegment = segmentIndex >= normalizedSegments.length - 1;
  const canAdvance = !isTyping && !isLastSegment;

  const skipOrAdvance = () => {
    if (isTyping) {
      setVisibleText(current.text);
      setIsTyping(false);
      return;
    }
    if (canAdvance) {
      const nextIndex = Math.min(segmentIndex + 1, normalizedSegments.length - 1);
      setSegmentIndex(nextIndex);
      setVisibleText("");
      setIsTyping(true);
    }
  };

  // Allow pressing Enter to advance when the chevron is visible
  useEffect(() => {
    if (!canAdvance) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        skipOrAdvance();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canAdvance, skipOrAdvance]);

  return (
    <div className={"relative" + (className ?? "")}>
      {label ? (
        <div className="absolute -top-5 sm:-top-7 md:-top-8 left-3 md:-translate-x-1/3 z-20 px-3 py-2 rounded-sm bg-cryptidz-jet text-white text-xs sm:text-base md:text-lg font-dialogue font-regular select-none">
          {label}
        </div>
      ) : null}
      <div
        className="h-30 md:h-40 rounded-md bg-cryptidz-white border-4 border-black/10 px-4 py-2 sm:py-3 text-black text-base sm:text-lg md:text-xl lg:text-[24px] relative z-10 font-dialogue"
        onClick={skipOrAdvance}
        role="button"
        aria-label="Dialogue"
      >
        <p className={"whitespace-pre-wrap " + (current.italic ? "italic " : "") + (current.bold ? "font-semibold " : "")}>
          {visibleText}
        </p>
        {canAdvance ? (
          <button
            type="button"
            onClick={skipOrAdvance}
            className="absolute bottom-2 right-2 h-6 w-6 md:h-8 md:w-8 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
            aria-label="Next"
          >
            <svg viewBox="0 0 24 24" className="h-full w-full motion-safe:animate-bounce" aria-hidden="true">
              <polygon points="12,16 6,8 18,8" className="fill-[#e16252]" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}

export type { DialogueSegment };


