import React from "react";
import Image from "next/image";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  size?: "small" | "normal" | "large";
}

const PrimaryButton = ({
  children,
  onClick,
  className = "",
  iconSrc,
  iconAlt = "Button icon",
  disabled = false,
  size = "normal"
}: PrimaryButtonProps) => {
  const sizeClasses = {
    small: "text-sm px-4 py-2 sm:px-5 sm:py-2.5",
    normal: "text-base px-4 py-2.5 sm:px-6 sm:py-2.5 sm:text-lg",
    large:
      "text-base px-8 py-3 sm:px-12 sm:py-3.5 md:px-16 md:py-4 sm:text-lg md:text-xl",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-3
        bg-cryptidz-yellow
        border-[4px] border-cryptidz-old-gold
        rounded-full
        text-cryptidz-dark-purple
        font-bold font-body
        transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:opacity-90 active:scale-[0.98]
        cursor-pointer
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {iconSrc && (
        <Image
          src={iconSrc}
          alt={iconAlt}
          width={24}
          height={24}
          className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6"
        />
      )}
      <span className="uppercase">{children}</span>
    </button>
  );
};

export default PrimaryButton;
