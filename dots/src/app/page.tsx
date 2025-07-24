"use client";

import Image from "next/image";
import ToggleCircle from "@/components/ToggleCircle";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  const handleToggle = (isRotated: boolean) => {
    console.log("Toggle state:", isRotated);
    // Add your toggle logic here
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
          <div className="bg-[#1D1D1D] rounded-l-2xl w-[340px] shadow-sm border-r border-[#292929] relative p-6" style={{ borderRightWidth: '1px' }}>
            {/* Left card content */}
            <SearchBar />
            <ToggleCircle onToggle={handleToggle} />
          </div>
          <div className="bg-[#1D1D1D] rounded-r-2xl flex-1 shadow-sm">
            {/* Right card content */}
          </div>
        </div>
      </div>
    </div>
  );
}
