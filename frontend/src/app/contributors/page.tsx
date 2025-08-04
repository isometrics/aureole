"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ToggleCircle from "@/components/ToggleCircle";
import Sidebar from "@/components/Sidebar";
import TitleDropdown from "@/components/TitleDropdown";

export default function ContributorsPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (isRotated: boolean) => {
    setIsCollapsed(isRotated);
  };

  const handleExpand = () => {
    setIsCollapsed(false);
  };

  const handleJobSubmit = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleTitleChange = (title: string) => {
    if (title === "Chat") {
      router.push('/chat');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="h-screen bg-[#242424] flex flex-col">
      {/* Topbar */}
      <div className="h-[60px] bg-[#242424] flex items-center px-6 flex-shrink-0">
        <div className="w-[30px]"></div>
        <div className="flex items-center gap-4">
          {/* Halo Logo */}
          <div className="relative w-8 h-8">
            <svg className="w-full h-full" viewBox="0 0 32 32">
              <defs>
                <linearGradient id="haloGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="12" fill="none" stroke="url(#haloGradient)" strokeWidth="3" />
            </svg>
          </div>
          {/* Title Dropdown */}
          <TitleDropdown onTitleChange={handleTitleChange} />
        </div>
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="ml-auto flex items-center gap-2 text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>
      
      {/* Main content area */}
      <div className="flex-1 px-4 pb-4 overflow-hidden">
        <div className="flex h-full overflow-hidden">
          <div className={`bg-[#1D1D1D] rounded-l-2xl shadow-sm border-r border-[#292929] relative transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-24' : 'w-[340px]'
          }`} style={{ borderRightWidth: '1px' }}>
            {/* Left card content */}
            <Sidebar 
              isCollapsed={isCollapsed} 
              onExpand={handleExpand} 
              onJobSubmit={handleJobSubmit}
              currentTitle="8Knot"
            />
            <ToggleCircle onToggle={handleToggle} isCollapsed={isCollapsed} />
          </div>
          <div className="bg-[#1D1D1D] rounded-r-2xl flex-1 shadow-sm overflow-hidden">
            {/* Contributors Content */}
            <div className="p-8">
              <h1 className="text-3xl font-bold text-white mb-6">Contributors</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Top Contributors */}
                <div className="bg-[#292929] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Contributors</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">JD</div>
                      <div>
                        <p className="text-white font-medium">John Doe</p>
                        <p className="text-gray-400 text-sm">1,247 commits</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">JS</div>
                      <div>
                        <p className="text-white font-medium">Jane Smith</p>
                        <p className="text-gray-400 text-sm">892 commits</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">MJ</div>
                      <div>
                        <p className="text-white font-medium">Mike Johnson</p>
                        <p className="text-gray-400 text-sm">654 commits</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#292929] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">New Contributors</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">AL</div>
                      <div>
                        <p className="text-white font-medium">Alice Lee</p>
                        <p className="text-gray-400 text-sm">First commit 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">BW</div>
                      <div>
                        <p className="text-white font-medium">Bob Wilson</p>
                        <p className="text-gray-400 text-sm">First commit 1 week ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#292929] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Contributor Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Contributors</span>
                      <span className="text-white font-semibold">892</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active This Month</span>
                      <span className="text-white font-semibold">234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">New This Month</span>
                      <span className="text-white font-semibold">45</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#292929] rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Contributor Activity</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#1D1D1D] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">JD</div>
                      <div>
                        <p className="text-white font-medium">John Doe</p>
                        <p className="text-gray-400 text-sm">Committed to react/react</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#1D1D1D] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">JS</div>
                      <div>
                        <p className="text-white font-medium">Jane Smith</p>
                        <p className="text-gray-400 text-sm">Opened PR in vuejs/vue</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">4 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 