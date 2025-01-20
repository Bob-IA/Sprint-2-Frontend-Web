import React from 'react';

function TopBar({ user, children, onLogoClick }) {
  return (
    <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      {/* Título / Logo principal */}
      <h1
        className="text-2xl font-extrabold cursor-pointer tracking-wide hover:text-blue-300 transition-all"
        onClick={onLogoClick} // Hacemos que el título sea clicable
      >
        Bob IA
      </h1>

      {/* Contenedor central */}
      <div className="flex-1 flex justify-center mx-8 items-center space-x-4">
        {children}
      </div>

      {/* Imagen del logo */}
      <div className="relative">
        <img
          src="/logo1.jpg"
          alt="logo"
          className="w-16 h-16 rounded-full cursor-pointer border-2 border-white hover:scale-110 transition-transform duration-300"
          onClick={onLogoClick}
        />
      </div>
    </div>
  );
}

export default TopBar;
