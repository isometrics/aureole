"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { DataResponse, CombinedItem } from "@/types/api";
import Fuse from 'fuse.js';
import SearchInput from "./SearchInput";
import Tags from "./Tags";
import DropdownMenu from "./DropdownMenu";

/**
 * Props interface for the SearchBar component
 * @param isCollapsed - Whether the search bar should be in collapsed state
 * @param onExpand - Callback function to expand the sidebar when search circle is clicked
 */
interface SearchBarProps {
  isCollapsed?: boolean;
  onExpand?: () => void;
}

/**
 * SearchBar component - Main search interface with tag selection
 * Manages the complete search state including selected tags, dropdown visibility,
 * API data fetching, and user interactions
 */
export default function SearchBar({ isCollapsed = false, onExpand }: SearchBarProps) {
  // Search input value
  const [searchValue, setSearchValue] = useState("");
  
  // Array of selected tags (repositories and topics)
  const [selectedTags, setSelectedTags] = useState<CombinedItem[]>([]);
  
  // Controls dropdown menu visibility
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  // API response data (repositories and topics)
  const [data, setData] = useState<DataResponse | null>(null);
  
  // Loading state for API calls
  const [loading, setLoading] = useState(false);
  
  // Error state for API failures
  const [error, setError] = useState<string | null>(null);

  // Server-side search with debouncing
  useEffect(() => {
    // Only run search when user is actually typing
    if (!searchValue.trim()) {
      return; // Don't do anything if no search value
    }

    const searchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/data?q=${encodeURIComponent(searchValue)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchData, 800); // 800ms debounce
    return () => clearTimeout(timer);
  }, [searchValue]); // Only depend on searchValue, not data or loading

  // Load initial data only once on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (data) return; // Don't load if we already have data
      
      setLoading(true);
      try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []); // Empty dependency array - only runs once on mount

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if click is outside the search container and dropdown
      if (!target.closest('.search-container') && !target.closest('.dropdown-menu')) {
        setIsPopupOpen(false);
      }
    };

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  /**
   * Handles input click - fetches data on first click if not already loaded
   * Opens the dropdown menu for tag selection
   */
  const handleInputClick = async () => {
    // Only fetch data if we haven't loaded it yet and aren't currently loading
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
    // Always open the dropdown when input is clicked
    setIsPopupOpen(true);
  };

  /**
   * Handles input blur with delay to allow clicking on dropdown items
   * The 200ms delay prevents the dropdown from closing immediately when clicking items
   */
  const handleInputBlur = () => {
    // Delay closing to allow clicking on items
    setTimeout(() => setIsPopupOpen(false), 200);
  };

  /**
   * Removes a tag from the selected tags array
   * Compares both type and value to ensure correct tag removal
   */
  const removeTag = (tagToRemove: CombinedItem) => {
    setSelectedTags(selectedTags.filter(tag => 
      !(tag.type === tagToRemove.type && tag.value === tagToRemove.value)
    ));
  };

  /**
   * Handles selection of a tag from the dropdown
   * Prevents duplicate selections and closes the dropdown
   */
  const handleItemSelect = (item: CombinedItem) => {
    // Check if tag is already selected to prevent duplicates
    const isAlreadySelected = selectedTags.some(tag => 
      tag.type === item.type && tag.value === item.value
    );
    
    if (!isAlreadySelected) {
      setSelectedTags([...selectedTags, item]);
    }
    setIsPopupOpen(false);
  };

  // If collapsed, show just a circle with magnifying glass
  if (isCollapsed) {
    return (
      <div className="p-6">
        <div 
          className="w-12 h-12 bg-[#1D1D1D] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#404040] transition-colors"
          style={{ border: '1.4px solid #404040' }}
          onClick={onExpand}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-6 search-container">
      {/* Main search container with dynamic height based on selected tags */}
      <div 
        className={`w-full bg-[#1D1D1D] rounded-[20px] border border-[#404040] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200 hover:border-[#505050] focus-within:border-blue-500 cursor-pointer ${
          selectedTags.length > 0 ? 'min-h-12' : 'h-12'
        }`}
        onClick={handleInputClick}
      >
        {/* Display selected tags as removable chips */}
        <Tags selectedTags={selectedTags} onRemoveTag={removeTag} />
        
        {/* Search input field */}
        <SearchInput
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          selectedTags={selectedTags}
          onInputClick={handleInputClick}
          onInputBlur={handleInputBlur}
        />
      </div>

      {/* Dropdown menu for tag selection */}
      <DropdownMenu
        isOpen={isPopupOpen}
        loading={loading}
        error={error}
        data={data}
        selectedTags={selectedTags}
        onItemSelect={handleItemSelect}
      />
    </div>
  );
} 