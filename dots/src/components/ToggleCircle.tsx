"use client";

import { useState } from "react";

interface ToggleCircleProps {
  onToggle?: (isRotated: boolean) => void;
}

export default function ToggleCircle({ onToggle }: ToggleCircleProps) {
  const [isRotated, setIsRotated] = useState(false);

  const handleCircleClick = () => {
    const newState = !isRotated;
    setIsRotated(newState);
    onToggle?.(newState);
  };

  return (
    <div 
      className="absolute -right-3 top-[6.25%] transform -translate-y-1/2 w-6 h-6 bg-[#1D1D1D] border-2 border-[#292929] rounded-full z-10 cursor-pointer flex items-center justify-center"
      onClick={handleCircleClick}
    >
      <svg 
        className={`w-3 h-3 text-white transition-transform duration-200 ${isRotated ? 'rotate-180' : ''}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
} 