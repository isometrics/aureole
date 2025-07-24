"use client";

import { useState, useEffect } from "react";
import { DataResponse, CombinedItem } from "@/types/api";
import SearchInput from "./SearchInput";
import Tags from "./Tags";
import DropdownMenu from "./DropdownMenu";

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

  const handleItemSelect = (item: CombinedItem) => {
    // Check if tag is already selected
    const isAlreadySelected = selectedTags.some(tag => 
      tag.type === item.type && tag.value === item.value
    );
    
    if (!isAlreadySelected) {
      setSelectedTags([...selectedTags, item]);
    }
    setIsPopupOpen(false);
  };

  return (
    <div className="relative">
      <div 
        className={`w-full bg-[#1D1D1D] rounded-[20px] border border-[#404040] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200 hover:border-[#505050] focus-within:border-blue-500 cursor-pointer ${
          selectedTags.length > 0 ? 'min-h-12' : 'h-12'
        }`}
        onClick={handleInputClick}
      >
        <Tags selectedTags={selectedTags} onRemoveTag={removeTag} />
        <SearchInput
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          selectedTags={selectedTags}
          onInputClick={handleInputClick}
          onInputBlur={handleInputBlur}
        />
      </div>

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