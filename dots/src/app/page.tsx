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
    <div className="min-h-screen p-4 bg-[#242424]">
      <div className="flex h-full min-h-[calc(100vh-2rem)]">
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
  );
}
