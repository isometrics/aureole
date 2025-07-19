"use client";

import { useState } from "react";

export default function Home() {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(clickCount + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to Next.js!
        </h1>
        <p className="text-gray-600 mb-6">
          You're building your first full-stack web application. 
          This page updates automatically when you save!
        </p>
        <div className="space-y-3">
          <button 
            onClick={handleClick}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Clicked {clickCount} times!
          </button>
          <a 
            href="/about" 
            className="block w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Visit About Page
          </a>
          <p className="text-sm text-gray-500">
            Try editing this file: <code className="bg-gray-100 px-2 py-1 rounded">src/app/page.tsx</code>
          </p>
        </div>
      </div>
    </div>
  );
}
