"use client";

import { useState } from "react";

export default function SearchBar() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="relative">
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search for orgs and repos"
        className="w-full h-12 px-4 pl-10 bg-[#1D1D1D] rounded-[20px] border border-[#404040] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 font-inter"
      />
      <svg
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11.1291 9.87919H10.4707L10.2374 9.65419C11.0541 8.70419 11.5457 7.47086 11.5457 6.12919C11.5457 3.13752 9.12074 0.712524 6.12907 0.712524C3.1374 0.712524 0.712402 3.13752 0.712402 6.12919C0.712402 9.12086 3.1374 11.5459 6.12907 11.5459C7.47074 11.5459 8.70407 11.0542 9.65407 10.2375L9.87907 10.4709V11.1292L14.0457 15.2875L15.2874 14.0459L11.1291 9.87919ZM6.12907 9.87919C4.05407 9.87919 2.37907 8.20419 2.37907 6.12919C2.37907 4.05419 4.05407 2.37919 6.12907 2.37919C8.20407 2.37919 9.87907 4.05419 9.87907 6.12919C9.87907 8.20419 8.20407 9.87919 6.12907 9.87919Z" fill="#C7C7C7"/>
      </svg>
    </div>
  );
} 