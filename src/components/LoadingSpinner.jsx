import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col justify-center items-center w-80 h-80 md:w-96 md:h-96">
        {/* Logo */}
        <img
          src="/logo1.jpg"
          alt="Logo"
          className="h-24 w-24 md:h-32 md:w-32 mb-6 rounded-full shadow-md"
        />

        {/* Spinner */}
        <div className="loader inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>

        {/* Texto animado */}
        <div className="text-lg md:text-xl font-bold text-blue-900 flex space-x-1">
          {"Buscando...".split("").map((letter, index) => (
            <span
              key={index}
              className={`animate-bounce ${
                index % 2 === 0 ? "text-blue-700" : "text-blue-500"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Puntos suspensivos */}
        <div className="flex space-x-2 mt-4 text-blue-500">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></span>
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
