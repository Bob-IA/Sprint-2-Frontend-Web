import React, { useState } from 'react';
import TopBar from './components/TopBar';
import ProductSearch from './components/ProductSearch';

function App() {
  const [searchResults, setSearchResults] = useState({
    productos_encontrados: [],
    productos_similares: []
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSimilares, setLoadingSimilares] = useState(false);
  const [showMoreEncontrados, setShowMoreEncontrados] = useState(false);
  const [showMoreSimilares, setShowMoreSimilares] = useState(false);

  const handleSearchResults = (results) => {
    console.log('Resultados de la búsqueda recibidos:', results);
    setSearchResults({
      productos_encontrados: results.productos_encontrados,
      productos_similares: results.productos_similares
    });
    setSelectedProducts([]); // Reset selected products on new search
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

  // Función para manejar la descarga de productos seleccionados o todos los productos
  const handleDownloadSelected = async (descargarTodo = false) => {
    // Si no hay productos seleccionados y no se está descargando todo
    if (selectedProducts.length === 0 && !descargarTodo) {
      console.error('No hay productos seleccionados para descargar.');
      return;
    }

    // Crear una lista con los productos seleccionados o todos los productos
    let productos = [];
    if (descargarTodo) {
      productos = searchResults.productos_encontrados;
    } else {
      productos = searchResults.productos_encontrados.filter(producto =>
        selectedProducts.includes(producto.sku)
      );
    }

    try {
      const response = await fetch('http://localhost:5000/descargar-productos', {
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
        <ProductSearch onSearchResults={handleSearchResults} setLoading={setLoading} />
      </TopBar>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full bg-white p-4 overflow-y-auto transition-all duration-300 ease-in-out">
          {/* Sección de Productos Encontrados */}
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

          {loading ? (
            <div className="flex justify-center items-center mt-4">
              <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 animate-spin"></div>
            </div>
          ) : (
            <ul className="flex flex-wrap mt-4">
              {searchResults.productos_encontrados.slice(0, showMoreEncontrados ? searchResults.productos_encontrados.length : 3).map((result, index) => (
                <li
                  key={index}
                  className="mb-4 mr-4 flex-shrink-0 w-1/4 bg-gray-100 p-2 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-200 ease-in-out"
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(result.sku)}
                      onChange={() => handleProductSelection(result.sku)}
                      className="mr-2 mt-1"
                    />
                    <div>
                      <div className="text-sm"><strong>Nombre:</strong> {result.nombre}</div>
                      <div className="text-sm"><strong>Marca:</strong> {result.marca}</div>
                      <div className="text-sm"><strong>SKU:</strong> {result.sku}</div>
                      {result['URL de la Imagen'] && (
                        <img
                          src={result['URL de la Imagen']}
                          alt={result['Nombre del Producto']}
                          className="mt-2 w-32 h-32 object-cover rounded-md shadow-sm"
                        />
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Sección de Botones de Descarga */}
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
        </div>
      </div>
    </div>
  );
}

export default App;
