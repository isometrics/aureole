"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface TitleDropdownProps {
  onTitleChange: (title: string) => void;
}

export default function TitleDropdown({ onTitleChange }: TitleDropdownProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("8Knot");

  // Update current title based on pathname
  useEffect(() => {
    if (pathname === '/chat') {
      setCurrentTitle("Chat");
    } else {
      setCurrentTitle("8Knot");
    }
  }, [pathname]);

  const titles = ["Chat", "8Knot"];

  const handleTitleSelect = (title: string) => {
    setCurrentTitle(title);
    onTitleChange(title);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-2xl font-bold text-white tracking-wide font-inter hover:text-blue-400 transition-colors duration-200"
      >
        <span>{currentTitle}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-[#292929] rounded-lg shadow-lg z-50 min-w-[120px] border border-[#404040]">
          {titles.map((title) => (
            <button
              key={title}
              onClick={() => handleTitleSelect(title)}
              className={`w-full px-4 py-2 text-left text-sm font-inter transition-colors duration-150 ease-in-out ${
                currentTitle === title
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-[#404040] hover:text-white'
              } ${title === titles[0] ? 'rounded-t-lg' : ''} ${title === titles[titles.length - 1] ? 'rounded-b-lg' : ''}`}
            >
              {title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 