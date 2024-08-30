import React, { useState } from 'react';

function TopBar({ user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center relative">
      <h1 className="text-xl font-bold">Bob IA</h1>
      <div className="relative">
        <button
          onClick={toggleMenu}
          className="bg-blue-800 p-2 rounded-full flex items-center focus:outline-none"
        >
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full mr-2"
          />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 text-gray-800">
            <div className="px-4 py-2">
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-full mx-auto mb-2"
              />
              <h2 className="text-lg font-semibold text-center">{user.name}</h2>
              <p className="text-sm text-gray-600 text-center">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopBar;
