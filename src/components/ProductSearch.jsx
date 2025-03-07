import React, { useState } from "react";
import ErrorModal from "./ErrorModal";

function ProductSearch({ onSearchResults, setLoading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFile, setSearchFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();

    if (searchFile) {
      formData.append("busqueda", searchFile);
    } else if (searchTerm.trim()) {
      formData.append("nombres_productos", searchTerm.trim());
    } else {
      setErrorMessage("Debes ingresar un nombre o cargar un archivo.");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://ms-ia.tssw.cl/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error en la solicitud: ${errorDetails}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Estructura inesperada en la respuesta del servidor");
      }

      onSearchResults(data);
    } catch (error) {
      console.error("Error durante la búsqueda:", error);
      setErrorMessage(
        error.message || "Error al conectar con el servicio. Inténtalo de nuevo más tarde."
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };
// Manejo de mensajes recibidos desde el chat
React.useEffect(() => {
  const handleSearchFromChat = (event) => {
    setSearchTerm(event.detail); // Actualizar barra de búsqueda con el texto recibido
  };

  window.addEventListener("searchFromChat", handleSearchFromChat);

  return () => {
    window.removeEventListener("searchFromChat", handleSearchFromChat);
  };
}, []);



  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["text/csv"];
      if (!validTypes.includes(file.type)) {
        setErrorMessage("El archivo debe ser un CSV válido.");
        setShowErrorModal(true);
        return;
      }
      setSearchFile(file);
      setFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setSearchFile(null);
    setFileName("");
  };

  return (
    <>
      <form className="flex items-center w-full" onSubmit={handleSearch}>
        {/* Barra de búsqueda */}
        <div className="relative w-full max-w-3xl search-bar">
          <input
            type="text"
            className={`w-full px-6 py-3 border ${
              searchFile ? "border-gray-300" : "border-blue-500"
            } rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black`}
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!!searchFile}
            style={{ paddingRight: searchFile ? "7rem" : "4rem" }}
          />

          {/* Botón para subir archivo */}
          <label className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500 hover:text-blue-600 transition-transform hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656L7.05 9.879a6 6 0 008.485 8.485L17 16"
              />
            </svg>
          </label>
        </div>

        {/* Botón de búsqueda */}
        <button
          type="submit"
          className="ml-4 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transform transition-all duration-300 active:scale-95"
        >
          Buscar
        </button>

        {/* Indicador de archivo cargado */}
        {fileName && (
          <div className="flex items-center ml-4 p-2 bg-gray-100 rounded-lg shadow-md">
            <span className="text-sm text-gray-700 font-medium mr-2">
              {fileName}
            </span>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 transform hover:scale-110 transition-all duration-200"
            >
              ✕
            </button>
          </div>
        )}
      </form>

      {/* Modal de error */}
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
