import React, { useState } from 'react';

function ProductSearch({ onSearchResults, setLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFile, setSearchFile] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData();
  
    if (searchFile) {
      formData.append('busqueda', searchFile);  // Enviar archivo CSV de búsqueda
    } else if (searchTerm) {
      formData.append('nombres_productos', searchTerm);  // Enviar término de búsqueda desde la barra
    } else {
      console.error('Debe ingresar un nombre de producto o cargar un archivo');
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch('https://ms-ia.tssw.cl/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Error al procesar la búsqueda');
      }
  
      const data = await response.json();
      onSearchResults(data);
    } catch (error) {
      console.error('Error durante la búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleFileChange = (e) => {
    setSearchFile(e.target.files[0]);
  };

  return (
    <form className="flex items-center" onSubmit={handleSearch}>
      <div className="relative w-full">
        {/* Input de búsqueda */}
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring focus:ring-blue-500 text-black"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Ícono de clip para subir archivo */}
        <label className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
          <input type="file" className="hidden" onChange={handleFileChange} />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656L7.05 9.879a6 6 0 008.485 8.485L17 16" />
          </svg>
        </label>
      </div>

      <button
        type="submit"
        className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow hover:bg-blue-600 transition-colors"
      >
        Buscar
      </button>
    </form>
  );
}

export default ProductSearch;