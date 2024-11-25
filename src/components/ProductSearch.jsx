import React, { useState } from 'react';
import ErrorModal from './ErrorModal';

function ProductSearch({ onSearchResults, setLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFile, setSearchFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      setErrorMessage('Error al conectar con el servicio. Inténtalo de nuevo mas tarde.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSearchFile(file);
      setFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setSearchFile(null);
    setFileName('');
  };

  return (
    <>
      <form className="flex items-center w-full" onSubmit={handleSearch}>
        <div className="relative w-full max-w-3xl">
          {/* Input de búsqueda */}
          <input
            type="text"
            className="w-full px-6 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring focus:ring-blue-500 text-black"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingRight: searchFile ? '7rem' : '4rem' }} // Ajustar el padding para dejar espacio al icono
          />

          {/* Ícono de clip para subir archivo */}
          <label className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656L7.05 9.879a6 6 0 008.485 8.485L17 16" />
            </svg>
          </label>
        </div>

        <button
          type="submit"
          className="ml-4 bg-blue-500 text-white px-6 py-3 rounded-full shadow hover:bg-blue-600 transition-colors"
        >
          Buscar
        </button>

        {/* Mostrar el nombre del archivo cargado y la opción para eliminarlo */}
        {fileName && (
          <div className="flex items-center ml-4 p-2 bg-gray-100 rounded-lg shadow-sm">
            <span className="text-sm text-gray-700 mr-2">{fileName}</span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </form>

      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </>
  );
}

export default ProductSearch;