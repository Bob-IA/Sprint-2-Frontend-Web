import React, { useState } from 'react';
import TopBar from './components/TopBar';
import ProductSearch from './components/ProductSearch';
import Welcome from './components/welcome'; 
import LoadingSpinner from './components/LoadingSpinner'; 

function App() {
  const [searchResults, setSearchResults] = useState({
    productos_encontrados: [],
    productos_similares: []
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [showMoreEncontrados, setShowMoreEncontrados] = useState(false);
  const [showMoreSimilares, setShowMoreSimilares] = useState(false);

  const handleSearchResults = (results) => {
    console.log('Resultados de la búsqueda recibidos:', results);

    setLoading(false);

    if (!Array.isArray(results) || results.length === 0) {
      console.error('Los resultados de búsqueda no tienen el formato esperado.');
      setSearchResults({ productos_encontrados: [], productos_similares: [] });
      return;
    }

    const productos_encontrados = results
      .filter(result => !result.error && result.productos_exactos)
      .flatMap(result => result.productos_exactos);

    const productos_similares = results
      .filter(result => !result.error && result.productos_similares)
      .flatMap(result => {
        if (!result.productos_similares || typeof result.productos_similares !== 'string') {
          console.log('No se encontraron productos similares válidos.');
          return [];
        }

        console.log('Productos similares recibidos antes del parseo:', result.productos_similares);
        
        return result.productos_similares.split('\n').map(similar => {
          const producto = {};
          const partes = similar.split(', ');

          partes.forEach(parte => {
            const [clave, valor] = parte.split(': ');
            if (clave && valor) {
              producto[clave.trim()] = valor.trim();
            }
          });

          return Object.keys(producto).length > 0 ? producto : null;
        }).filter(Boolean);
      });

    console.log('Productos similares parseados:', productos_similares);

    setSearchResults({
      productos_encontrados: productos_encontrados || [],
      productos_similares: productos_similares || []
    });

    setSelectedProducts([]);
  };

  const handleProductSelection = (sku) => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.includes(sku)) {
        return prevSelected.filter((item) => item !== sku);
      } else {
        return [...prevSelected, sku];
      }
    });
  };

  const handleDownloadSelected = async (descargarTodo = false) => {
    if (selectedProducts.length === 0 && !descargarTodo) {
      console.error('No hay productos seleccionados para descargar.');
      return;
    }
  
    let productos = [];
    if (descargarTodo) {
      productos = searchResults.productos_encontrados;
    } else {
      productos = searchResults.productos_encontrados.filter(producto =>
        selectedProducts.includes(producto.SKU)
      );
    }
  
    try {
      const response = await fetch('https://ms-download.tssw.cl/descargar-productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productos, descargar_todo: descargarTodo }),
      });
  
      if (!response.ok) {
        throw new Error('Error al descargar el archivo.');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'productos_seleccionados.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error durante la descarga:', error);
    }
  };
  
  return (
    <div className="h-screen flex flex-col">
      <TopBar>
        <ProductSearch
          onSearchResults={handleSearchResults}
          setLoading={setLoading} // Pasar la función setLoading al componente ProductSearch
        />
      </TopBar>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full bg-white p-4 overflow-y-auto transition-all duration-300 ease-in-out">
          {/* Mostrar el componente LoadingSpinner si loading es true */}
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {searchResults.productos_encontrados.length === 0 &&
                searchResults.productos_similares.length === 0 && (
                  <Welcome />
                )}

              {/* Sección de productos encontrados */}
              {searchResults.productos_encontrados.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Productos Encontrados</h2>
                    {searchResults.productos_encontrados.length > 3 && (
                      <button
                        className="text-sm px-4 py-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
                        onClick={() => setShowMoreEncontrados(!showMoreEncontrados)}
                      >
                        {showMoreEncontrados ? 'Mostrar Menos' : 'Mostrar Más'}
                      </button>
                    )}
                  </div>

                  <ul className="flex flex-wrap mt-4">
                    {searchResults.productos_encontrados
                      .slice(0, showMoreEncontrados ? searchResults.productos_encontrados.length : 3)
                      .map((result, index) => (
                        <li
                          key={index}
                          className="mb-4 mr-4 flex-shrink-0 w-1/4 bg-gray-100 p-2 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-200 ease-in-out"
                        >
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(result.SKU)}
                              onChange={() => handleProductSelection(result.SKU)}
                              className="mr-2 mt-1"
                            />
                            <div>
                              <div className="text-sm font-bold">{result.Nombre}</div>
                              <div className="text-sm"><strong>Marca:</strong> {result.Marca}</div>
                              <div className="text-sm italic">SKU: {result.SKU}</div>
                              {result.Imagen_URL && (
                                <img
                                  src={result.Imagen_URL}
                                  alt={result.Nombre}
                                  className="mt-2 w-32 h-32 object-cover rounded-md shadow-sm"
                                />
                              )}
                            </div>
                          </div>
                        </li>
                    ))}
                    {searchResults.productos_encontrados
                      .filter(result => result.error)
                      .map((result, index) => (
                        <li key={`error-${index}`} className="mb-4 w-full text-red-500">
                          No se encontró ningún producto que coincida con: {result.producto_buscado}
                        </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Sección de productos similares */}
              {searchResults.productos_similares.length > 0 && (
                <>
                  <div className="flex items-center justify-between mt-8">
                    <h2 className="text-lg font-bold">Productos Similares</h2>
                    {searchResults.productos_similares.length > 3 && (
                      <button
                        className="text-sm px-4 py-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
                        onClick={() => setShowMoreSimilares(!showMoreSimilares)}
                      >
                        {showMoreSimilares ? 'Mostrar Menos' : 'Mostrar Más'}
                      </button>
                    )}
                  </div>

                  <ul className="flex flex-wrap mt-4">
                    {searchResults.productos_similares
                      .slice(0, showMoreSimilares ? searchResults.productos_similares.length : 3)
                      .map((result, index) => (
                        <li
                          key={index}
                          className="mb-4 mr-4 flex-shrink-0 w-1/4 bg-gray-100 p-2 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-200 ease-in-out"
                        >
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(result.SKU)}
                              onChange={() => handleProductSelection(result.SKU)}
                              className="mr-2 mt-1"
                            />
                            <div>
                              <div className="text-sm font-bold">{result.Nombre}</div>
                              <div className="text-sm"><strong>Marca:</strong> {result.Marca}</div>
                              <div className="text-sm italic">SKU: {result.SKU}</div>
                            </div>
                          </div>
                        </li>
                    ))}
                  </ul>
                </>
              )}

              {(searchResults.productos_encontrados.length > 0 ||
                searchResults.productos_similares.length > 0) && (
                <div className="mt-6">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all duration-300 mr-4"
                    onClick={() => handleDownloadSelected(false)}
                  >
                    Descargar Productos Seleccionados
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-all duration-300"
                    onClick={() => handleDownloadSelected(true)}
                  >
                    Descargar Todos los Productos
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
