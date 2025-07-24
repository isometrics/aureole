"use client";

import { useState } from "react";
import Image from "next/image";
import ToggleCircle from "@/components/ToggleCircle";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = (isRotated: boolean) => {
    setIsCollapsed(isRotated);
  };

  const handleExpand = () => {
    setIsCollapsed(false);
  };

  return (
    <div className="h-screen bg-[#242424] flex flex-col">
      {/* Topbar */}
      <div className="h-[60px] bg-[#242424] flex items-center px-6 flex-shrink-0">
        <div className="w-[30px]"></div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" style={{ animation: 'pulse 2s ease-in-out 3 forwards' }}></div>
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-red-500" style={{ animation: 'pulse 2s ease-in-out 3 0.5s forwards' }}></div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent" style={{ animation: 'pulse 2s ease-in-out 3 forwards' }}>
            DOTS
          </h1>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 px-4 pb-4">
        <div className="flex h-full">
          <div className={`bg-[#1D1D1D] rounded-l-2xl shadow-sm border-r border-[#292929] relative transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-24' : 'w-[340px]'
          }`} style={{ borderRightWidth: '1px' }}>
            {/* Left card content */}
            <SearchBar isCollapsed={isCollapsed} onExpand={handleExpand} />
            <ToggleCircle onToggle={handleToggle} isCollapsed={isCollapsed} />
          </div>
          <div className="bg-[#1D1D1D] rounded-r-2xl flex-1 shadow-sm">
            {/* Right card content */}
          </div>
        </div>
      </div>
    </div>
  );
}
