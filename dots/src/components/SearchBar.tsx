"use client";

import { useState, useEffect } from "react";
import { DataResponse, CombinedItem } from "@/types/api";

export default function SearchBar() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<CombinedItem[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [data, setData] = useState<DataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputClick = async () => {
    if (!data && !loading) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    setIsPopupOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow clicking on items
    setTimeout(() => setIsPopupOpen(false), 200);
  };

  const removeTag = (tagToRemove: CombinedItem) => {
    setSelectedTags(selectedTags.filter(tag => 
      !(tag.type === tagToRemove.type && tag.value === tagToRemove.value)
    ));
  };

  return (
    <div className="relative">
      <div 
        className={`w-full bg-[#1D1D1D] rounded-[20px] border border-[#404040] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200 hover:border-[#505050] focus-within:border-blue-500 cursor-pointer ${
          selectedTags.length > 0 ? 'min-h-12' : 'h-12'
        }`}
        onClick={handleInputClick}
      >
        {/* Tags Container */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {selectedTags.map((tag, index) => (
              <div
                key={`${tag.type}-${tag.value}-${index}`}
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-inter ${
                  tag.type === 'repo' 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  tag.type === 'repo' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <span className="truncate max-w-32">{tag.original_label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  className="ml-1 hover:bg-white/10 rounded-full p-0.5 transition-colors"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Search Input */}
        <div className="relative h-12 flex items-center px-4">
          <svg
            className="absolute left-5 w-5 h-5 text-white z-10"
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M11.1291 9.87919H10.4707L10.2374 9.65419C11.0541 8.70419 11.5457 7.47086 11.5457 6.12919C11.5457 3.13752 9.12074 0.712524 6.12907 0.712524C3.1374 0.712524 0.712402 3.13752 0.712402 6.12919C0.712402 9.12086 3.1374 11.5459 6.12907 11.5459C7.47074 11.5459 8.70407 11.0542 9.65407 10.2375L9.87907 10.4709V11.1292L14.0457 15.2875L15.2874 14.0459L11.1291 9.87919ZM6.12907 9.87919C4.05407 9.87919 2.37907 8.20419 2.37907 6.12919C2.37907 4.05419 4.05407 2.37919 6.12907 2.37919C8.20407 2.37919 9.87907 4.05419 9.87907 6.12919C9.87907 8.20419 8.20407 9.87919 6.12907 9.87919Z" fill="currentColor"/>
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onBlur={handleInputBlur}
            placeholder={selectedTags.length === 0 ? "Search for orgs and repos" : "Add more..."}
            className="w-full h-12 pl-9 pr-4 bg-transparent border-none outline-none text-white placeholder-gray-400 font-inter"
            readOnly
          />
        </div>
      </div>

      {/* Modern Search Popup */}
      {isPopupOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1D1D1D] border border-[#404040] rounded-2xl shadow-2xl z-50 max-h-80 overflow-hidden">
          {/* Search Results Container */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-[#404040] scrollbar-track-transparent">
            {loading && (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-400 text-sm font-inter">Loading repositories...</span>
              </div>
            )}
            
            {error && (
              <div className="p-4 text-center text-red-400 text-sm font-inter">
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            {data && !loading && !error && (
              <div className="py-3">
                {data.all_items.map((item: CombinedItem, index: number) => (
                  <div
                    key={`${item.type}-${item.value}-${index}`}
                    className={`px-6 py-3 hover:bg-[#292929] cursor-pointer text-white text-sm transition-colors duration-150 ease-in-out border-l-2 font-inter ${
                      selectedTags.some(tag => tag.type === item.type && tag.value === item.value)
                        ? 'bg-[#292929]/50 border-green-500'
                        : 'border-transparent hover:border-blue-500'
                    }`}
                    onClick={() => {
                      // Check if tag is already selected
                      const isAlreadySelected = selectedTags.some(tag => 
                        tag.type === item.type && tag.value === item.value
                      );
                      
                      if (!isAlreadySelected) {
                        setSelectedTags([...selectedTags, item]);
                      }
                      setIsPopupOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${item.type === 'repo' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <span className="truncate">{item.label}</span>
                      </div>
                      {selectedTags.some(tag => tag.type === item.type && tag.value === item.value) && (
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer with count */}
          {data && !loading && !error && (
            <div className="px-4 py-2 border-t border-[#404040] bg-[#252525] text-xs text-gray-400 font-inter">
              {data.metadata.total_items} items available
            </div>
          )}
        </div>
      )}
    </div>
  );
} 