"use client";

import { CombinedItem } from "@/types/api";

/**
 * Props interface for the Tags component
 * @param selectedTags - Array of selected tags (repositories or topics) to display
 * @param onRemoveTag - Callback function called when a tag's remove button is clicked
 */
interface TagsProps {
  selectedTags: CombinedItem[];
  onRemoveTag: (tag: CombinedItem) => void;
}

/**
 * Tags component displays selected tags as removable chips
 * Each tag shows a colored indicator, label, and remove button
 * Tags are styled differently based on their type (repo vs topic)
 */
export default function Tags({ selectedTags, onRemoveTag }: TagsProps) {
  // Don't render anything if no tags are selected
  if (selectedTags.length === 0) return null;

  return (
    // Container with flexbox layout for wrapping tags
    <div className="flex flex-wrap gap-2 p-3 pb-0">
      {selectedTags.map((tag, index) => (
        <div
          // Unique key combining type, value, and index for React rendering
          key={`${tag.type}-${tag.value}-${index}`}
          // Dynamic styling based on tag type:
          // - Repo tags: Green theme with transparency
          // - Topic tags: Blue theme with transparency
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-inter ${
            tag.type === 'repo' 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}
        >
          {/* Colored indicator dot showing tag type */}
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            tag.type === 'repo' ? 'bg-green-500' : 'bg-blue-500'
          }`}></div>
          
          {/* Tag label with truncation for long text */}
          <span className="truncate max-w-48">{tag.original_label}</span>
          
          {/* Remove button with hover effects */}
          <button
            onClick={(e) => {
              // Prevent event bubbling to parent elements
              e.stopPropagation();
              // Call the remove callback with the tag to remove
              onRemoveTag(tag);
            }}
            className="ml-1 hover:bg-white/10 rounded-full p-0.5 transition-colors"
          >
            {/* X icon for remove functionality */}
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
} 