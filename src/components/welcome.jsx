import React from 'react';
import { FaPaperclip } from 'react-icons/fa';

const Welcome = () => {
  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-50 px-8 py-16 space-x-8">
      
      {/* Sección de bienvenida */}
      <div className="flex flex-col items-start text-left max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-3xl font-bold text-blue-700 mb-6">
          Bienvenido a BOB IA
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Comienza utilizando la barra de búsqueda para encontrar productos.
        </p>
      </div>

      {/* Sección de carga de archivos CSV */}
      <div className="flex flex-col items-start text-left max-w-md w-full bg-blue-100 rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <FaPaperclip className="text-blue-500 text-4xl mr-4" />
          <p className="text-2xl font-semibold text-blue-700">
            Subir archivos CSV
          </p>
        </div>
        <p className="text-gray-700 text-lg">
          Sube archivos CSV para búsquedas más rápidas haciendo clic en el icono.
        </p>
      </div>

      {/* Instrucciones adicionales */}
      <div className="flex flex-col items-start text-left max-w-md w-full bg-gray-100 rounded-lg shadow-lg p-6">
        <p className="text-lg text-gray-700 mb-4">
          Los resultados aparecerán para cada producto buscado.
        </p>
        <p className="text-lg text-gray-700">
          Puedes seleccionar productos para descargarlos en un archivo CSV.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
