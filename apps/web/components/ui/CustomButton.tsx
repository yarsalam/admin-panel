import React from "react";
import GlobalText from "./GlobalText";

interface Props {
  label: string;
  onClick?: () => void;
  gradient?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function CustomButton({
  label,
  onClick,
  gradient,
  loading,
  disabled,
  className,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`relative overflow-hidden py-2 px-4 rounded-lg w-full justify-center items-center  border-[0.6px] border-gray-300 
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}
        ${gradient ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-purple-600"}
        ${className ?? ""}`}
    >
      {gradient && (
        <span className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
      )}
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-white mx-auto"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <GlobalText className="text-white font-medium text-base">
          {label}
        </GlobalText>
      )}
    </button>
  );
}
