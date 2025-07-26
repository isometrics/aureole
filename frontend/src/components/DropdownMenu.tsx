"use client";

import { DataResponse, CombinedItem } from "@/types/api";

interface DropdownMenuProps {
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  data: DataResponse | null;
  selectedTags: CombinedItem[];
  onItemSelect: (item: CombinedItem) => void;
}

export default function DropdownMenu({
  isOpen,
  loading,
  error,
  data,
  selectedTags,
  onItemSelect
}: DropdownMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-6 right-6 -mt-3 bg-[#292929] rounded-2xl shadow-2xl z-50 max-h-80 overflow-hidden dropdown-menu">
      {/* Search Results Container */}
      <div className="max-h-80 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#404040] scrollbar-track-transparent">
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400 text-[14px] font-inter" style={{ fontWeight: 400, fontStyle: 'normal' }}>Loading repositories...</span>
          </div>
        )}
        
        {error && (
          <div className="p-3 text-center text-red-400 text-[14px] font-inter" style={{ fontWeight: 400, fontStyle: 'normal' }}>
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {data && !loading && !error && (
          <div className="py-2">
            <div className="px-4 py-1">
              <span className="font-inter text-[12px]" style={{ fontWeight: 600, fontStyle: 'normal', color: '#9C9C9C' }}>
                Repositories
              </span>
            </div>
            {data.all_items.map((item: CombinedItem, index: number) => (
              <div
                key={`${item.type}-${item.value}-${index}`}
                className={`px-4 py-2 hover:bg-[#292929] cursor-pointer text-white text-[14px] transition-colors duration-150 ease-in-out border-l-2 font-inter ${
                  selectedTags.some(tag => tag.type === item.type && tag.value === item.value)
                    ? 'bg-[#292929]/50 border-green-500'
                    : 'border-transparent hover:border-blue-500'
                }`}
                style={{ fontWeight: 400, fontStyle: 'normal' }}
                onClick={() => onItemSelect(item)}
              >
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center min-w-0 flex-1">
                    <span className="truncate">{item.label}</span>
                  </div>
                  {selectedTags.some(tag => tag.type === item.type && tag.value === item.value) && (
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="px-4 py-2 border-t border-[#404040] bg-[#252525] text-[14px] text-gray-400 font-inter" style={{ fontWeight: 400, fontStyle: 'normal' }}>
          {data.metadata.total_items} items available
        </div>
      )}
    </div>
  );
} 