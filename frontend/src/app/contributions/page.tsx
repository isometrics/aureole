"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ToggleCircle from "@/components/ToggleCircle";
import Sidebar from "@/components/Sidebar";
import TitleDropdown from "@/components/TitleDropdown";

export default function ContributionsPage() {
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
            {/* Contributions Content */}
            <div className="p-8">
              <h1 className="text-3xl font-bold text-white mb-6">Contributions</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Contribution Types */}
                <div className="bg-[#292929] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Contribution Types</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Commits</span>
                      <span className="text-green-400 font-semibold">45,231</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Pull Requests</span>
                      <span className="text-blue-400 font-semibold">12,847</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Issues</span>
                      <span className="text-yellow-400 font-semibold">8,932</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Reviews</span>
                      <span className="text-purple-400 font-semibold">15,643</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#292929] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Monthly Trends</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">This Month</span>
                      <span className="text-white font-semibold">+15%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Month</span>
                      <span className="text-white font-semibold">+8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">3 Months Ago</span>
                      <span className="text-white font-semibold">+12%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#292929] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Languages</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">JavaScript</span>
                      <span className="text-white font-semibold">32%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Python</span>
                      <span className="text-white font-semibold">28%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">TypeScript</span>
                      <span className="text-white font-semibold">18%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Go</span>
                      <span className="text-white font-semibold">12%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#292929] rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Recent Contributions</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#1D1D1D] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">C</div>
                      <div>
                        <p className="text-white font-medium">Commit: Fix navigation bug</p>
                        <p className="text-gray-400 text-sm">react/react • 2 hours ago</p>
                      </div>
                    </div>
                    <span className="text-green-400 text-sm">+150 lines</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#1D1D1D] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">PR</div>
                      <div>
                        <p className="text-white font-medium">PR: Add new feature</p>
                        <p className="text-gray-400 text-sm">vuejs/vue • 4 hours ago</p>
                      </div>
                    </div>
                    <span className="text-blue-400 text-sm">Open</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#1D1D1D] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">I</div>
                      <div>
                        <p className="text-white font-medium">Issue: Bug report</p>
                        <p className="text-gray-400 text-sm">angular/angular • 6 hours ago</p>
                      </div>
                    </div>
                    <span className="text-yellow-400 text-sm">Open</span>
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