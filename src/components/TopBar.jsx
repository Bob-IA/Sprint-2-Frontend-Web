import React from 'react';

function TopBar({ user, children }) {
  return (
    <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center relative">
      <h1 className="text-xl font-bold">Bob IA</h1>
      <div className="flex-1 flex justify-center">
        {children}
      </div>
      <div className="relative">
        <img
          src="/logo1.jpg"
          className="w-14 h-14 rounded-full"
        />
      </div>
    </div>
  );
}

export default TopBar;