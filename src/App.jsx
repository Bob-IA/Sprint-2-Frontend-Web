import React, { useState } from 'react';
import TopBar from './components/TopBar';
import ProductSearch from './components/ProductSearch';

function App() {
  const user = {
    name: 'Aburik',
    email: 'Babarca@example.com',
    avatar: 'https://pbs.twimg.com/media/GWMCvhMXsAAvXl8?format=jpg&name=medium'
  };

  const [searchResults, setSearchResults] = useState({
    productos_encontrados: [],
    productos_similares: []
  });

  const handleSearchResults = (results) => {
    console.log('Resultados de la búsqueda recibidos:', results);
    setSearchResults(results);
  };

  return (
    <div className="h-screen flex flex-col">
      <TopBar user={user} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 bg-gray-100">
          <ProductSearch onSearchResults={handleSearchResults} />
        </div>
        <div className="w-1/2 bg-white p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Resultados de la Búsqueda</h2>
          <h3 className="text-md font-semibold">Productos Encontrados</h3>
          <ul>
            {searchResults.productos_encontrados.map((result, index) => (
              <li key={index} className="mb-2">
                <div><strong>Nombre:</strong> {result['Nombre del Producto']}</div>
                <div><strong>Marca:</strong> {result['Marca']}</div>
                <div><strong>SKU:</strong> {result['SKU']}</div>
                {result['URL de la Imagen'] && <img src={result['URL de la Imagen']} alt={result['Nombre del Producto']} />}
              </li>
            ))}
          </ul>
          <h3 className="text-md font-semibold">Productos Similares</h3>
          <ul>
            {searchResults.productos_similares.map((result, index) => (
              <li key={index} className="mb-2">
                {result}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;