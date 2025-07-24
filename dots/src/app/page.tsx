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
        <Image src="/logo.svg" alt="8Knot Logo" width={72} height={24} />
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
