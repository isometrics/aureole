"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DataResponse, CombinedItem } from "@/types/api";
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
  
  // Debounced search value for filtering
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  
  // Search loading state
  const [isSearching, setIsSearching] = useState(false);

  // Optimized search value setter
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setIsSearching(true);
  }, []);

  // Debounce search input to prevent lag
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setIsSearching(false);
    }, 50); // Much faster - 50ms delay

    return () => clearTimeout(timer);
  }, [searchValue]);
  
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

  // IndexedDB setup and operations
  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DotsCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('apiData')) {
          db.createObjectStore('apiData', { keyPath: 'id' });
        }
      };
    });
  };

  const loadCachedData = async (): Promise<DataResponse | null> => {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['apiData'], 'readonly');
        const store = transaction.objectStore('apiData');
        const request = store.get('dots_data');
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.timestamp) {
            const cacheAge = Date.now() - result.timestamp;
            const cacheValid = cacheAge < 24 * 60 * 60 * 1000; // 24 hours
            
            if (cacheValid) {
              resolve(result.data);
            } else {
              // Cache expired, remove it
              const deleteTransaction = db.transaction(['apiData'], 'readwrite');
              const deleteStore = deleteTransaction.objectStore('apiData');
              deleteStore.delete('dots_data');
              resolve(null);
            }
          } else {
            resolve(null);
          }
        };
      });
    } catch (err) {
      console.error('Error loading cached data:', err);
      return null;
    }
  };

  const cacheData = async (apiData: DataResponse): Promise<void> => {
    try {
      const db = await initDB();
      const transaction = db.transaction(['apiData'], 'readwrite');
      const store = transaction.objectStore('apiData');
      
      await new Promise((resolve, reject) => {
        const request = store.put({
          id: 'dots_data',
          data: apiData,
          timestamp: Date.now()
        });
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    } catch (err) {
      console.error('Error caching data:', err);
    }
  };

  // Load cached data on component mount
  useEffect(() => {
    loadCachedData().then(cachedData => {
      if (cachedData) {
        setData(cachedData);
      }
    });
  }, []);

  // Fast search function - much more efficient than fuzzy search
  const fastSearch = useCallback((query: string, text: string): boolean => {
    if (!query) return true;
    return text.toLowerCase().includes(query.toLowerCase());
  }, []);

  // Filter data based on search value - memoized for performance with result limiting
  const filteredData = useMemo(() => {
    if (!data) return null;
    
    const filtered = data.all_items.filter(item => 
      fastSearch(debouncedSearchValue, item.label) || fastSearch(debouncedSearchValue, String(item.value))
    );
    
    // Limit results to first 50 items for better performance
    return {
      ...data,
      all_items: filtered.slice(0, 50)
    };
  }, [data, debouncedSearchValue, fastSearch]);

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
        await cacheData(result); // Cache the fetched data
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
          setSearchValue={handleSearchChange}
          selectedTags={selectedTags}
          onInputClick={handleInputClick}
          onInputBlur={handleInputBlur}
        />
      </div>

      {/* Dropdown menu for tag selection */}
      <DropdownMenu
        isOpen={isPopupOpen}
        loading={loading || isSearching}
        error={error}
        data={filteredData}
        selectedTags={selectedTags}
        onItemSelect={handleItemSelect}
      />
    </div>
  );
} 