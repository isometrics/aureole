"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ToggleCircle from "@/components/ToggleCircle";
import Sidebar from "@/components/Sidebar";
import TitleDropdown from "@/components/TitleDropdown";

export default function RepoOverviewPage() {
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
            {/* Repo Overview Content */}
            <div className="p-8">
              <h1 className="text-3xl font-bold text-white mb-6">Repository Overview</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="bg-[#292929] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Repositories</h3>
                  <p className="text-3xl font-bold text-blue-400">1,247</p>
                  <p className="text-gray-400 text-sm mt-2">+12% from last month</p>
                </div>
                
                <div className="bg-[#292929] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Active Contributors</h3>
                  <p className="text-3xl font-bold text-green-400">892</p>
                  <p className="text-gray-400 text-sm mt-2">+8% from last month</p>
                </div>
                
                <div className="bg-[#292929] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Total Commits</h3>
                  <p className="text-3xl font-bold text-purple-400">45,231</p>
                  <p className="text-gray-400 text-sm mt-2">+15% from last month</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
                <div className="bg-[#292929] rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-white">New commit in react/react</span>
                      <span className="text-gray-400 text-sm">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span className="text-white">Pull request opened in vuejs/vue</span>
                      <span className="text-gray-400 text-sm">4 hours ago</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-white">Issue reported in angular/angular</span>
                      <span className="text-gray-400 text-sm">6 hours ago</span>
                    </div>
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