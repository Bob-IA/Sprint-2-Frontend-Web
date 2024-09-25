import React, { useState } from 'react';
import axios from 'axios';

function ProductSearch({ onSearchResults }) {
  const [file, setFile] = useState(null);
  const [productName, setProductName] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleProductNameChange = (e) => {
    setProductName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Formulario enviado');
    if (!file || !productName) {
      alert('Por favor, sube un archivo CSV y proporciona un nombre de producto.');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('nombre_producto', productName);

    try {
      console.log('Enviando datos al servidor');
      const response = await axios.post('http://localhost:5000/procesar_csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Respuesta del servidor:', response.data);
      onSearchResults(response.data);
    } catch (error) {
      console.error('Error al procesar el archivo CSV:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Buscar Productos Similares</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Archivo CSV</label>
          <input type="file" onChange={handleFileChange} className="mt-1 block w-full" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
          <input
            type="text"
            value={productName}
            onChange={handleProductNameChange}
            className="mt-1 block w-full"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Buscar
        </button>
      </form>
    </div>
  );
}

export default ProductSearch;