"use client";

import Image from "next/image";
import ToggleCircle from "@/components/ToggleCircle";

export default function Home() {
  const handleToggle = (isRotated: boolean) => {
    console.log("Toggle state:", isRotated);
    // Add your toggle logic here
  };
  return (
    <div className="min-h-screen p-4">
      <div className="flex h-full min-h-[calc(100vh-2rem)]">
        <div className="bg-[#1D1D1D] rounded-l-2xl w-[340px] shadow-sm border-r border-[#292929] relative" style={{ borderRightWidth: '1px' }}>
          {/* Left card content */}
          <ToggleCircle onToggle={handleToggle} />
        </div>
        <div className="bg-[#1D1D1D] rounded-r-2xl flex-1 shadow-sm">
          {/* Right card content */}
        </div>
      </div>
    </div>
  );
}
