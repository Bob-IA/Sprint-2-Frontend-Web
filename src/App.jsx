import React, { useState } from 'react';
import TopBar from './components/TopBar';
import ProductSearch from './components/ProductSearch';
import Welcome from './components/welcome';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorModal from './components/ErrorModal';
import ChatWidget from './components/ChatWidget';

// Función para capitalizar la primera letra
const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Función para combinar productos y eliminar duplicados
const combineAndDeduplicate = (exactos, similares) => {
  const allProducts = [...exactos, ...similares];
  const uniqueProducts = allProducts.reduce((acc, product) => {
    if (!acc.some((p) => p.SKU === product.SKU)) {
      acc.push(product);
    }
    return acc;
  }, []);
  return uniqueProducts;
};

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0); // Estado para el precio total
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedTerms, setExpandedTerms] = useState({}); // Estado para manejar la expansión de términos

  const handleSearchResults = (results) => {
    console.log('Resultados de la búsqueda recibidos:', results);

    setLoading(false);

    if (typeof results === 'string' && results === 'No se encontró ningún producto que coincida.') {
      console.error(results);
      setErrorMessage(results);
      setShowErrorModal(true);
      setSearchResults([]);
      return;
    }

    if (!Array.isArray(results) || results.length === 0) {
      console.error('Los resultados de búsqueda no tienen el formato esperado.');
      setErrorMessage('Error al realizar la busqueda.');
      setShowErrorModal(true);
      setSearchResults([]);
      return;
    }

    const groupedResults = results.map((result) => {
      const productosSimilares = (result.productos_similares || [])
        .split('\n')
        .map((similar) => {
          const partes = similar.match(/SKU: (.*?), Nombre: (.*?), Marca: (.*?), Costo: (.*)/);
          if (partes) {
            return {
              SKU: partes[1].trim(),
              Nombre: partes[2].trim(),
              Marca: partes[3].trim(),
              Costo: Math.round(parseFloat(partes[4].trim())), // Redondear el costo
            };
          }
          return null;
        })
        .filter(Boolean);

      const productosExactos = (result.productos_exactos || []).map((producto) => ({
        SKU: producto.SKU,
        Nombre: producto.Nombre,
        Marca: producto.Marca,
        Imagen: producto.Imagen_URL,
        Costo: Math.round(parseFloat(producto.Costo)), // Redondear el costo
      }));

      const productosCombinados = combineAndDeduplicate(productosExactos, productosSimilares);

      return {
        productoBuscado: capitalize(result.producto_buscado), // Capitalizar término buscado
        productosCombinados,
      };
    });

    setSearchResults(groupedResults);
    setSelectedProducts([]);
    setTotalPrice(0); // Reinicia el precio total
    setExpandedTerms({}); // Reinicia los estados de expansión
  };

  const handleProductSelection = (sku, costo) => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.includes(sku)) {
        setTotalPrice((prevTotal) => prevTotal - costo);
        return prevSelected.filter((item) => item !== sku);
      } else {
        setTotalPrice((prevTotal) => prevTotal + costo);
        return [...prevSelected, sku];
      }
    });
  };

  const toggleExpanded = (termIndex) => {
    setExpandedTerms((prevState) => ({
      ...prevState,
      [termIndex]: !prevState[termIndex],
    }));
  };

  const handleDownloadSelected = async (descargarTodo = false) => {
    if (selectedProducts.length === 0 && !descargarTodo) {
      console.error('No hay productos seleccionados para descargar.');
      setErrorMessage('No hay productos seleccionados para descargar.');
      setShowErrorModal(true);
      return;
    }

    let productos = [];
    if (descargarTodo) {
      productos = searchResults.flatMap(result => result.productosCombinados);
    } else {
      productos = searchResults.flatMap(result =>
        result.productosCombinados.filter(producto =>
          selectedProducts.includes(producto.SKU)
        )
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
      a.download = 'productos_seleccionados.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error durante la descarga:', error);
      setErrorMessage('Error durante la descarga. Inténtalo de nuevo.');
      setShowErrorModal(true);
    }
  };

  const handleLogoClick = () => {
    setSearchResults([]);
    setSelectedProducts([]);
    setTotalPrice(0); // Reinicia el precio total
  };

  return (
    <div className="h-screen flex flex-col">
      <TopBar onLogoClick={handleLogoClick}>
        <ProductSearch
          onSearchResults={handleSearchResults}
          setLoading={setLoading}
        />
      </TopBar>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full bg-white p-4 overflow-y-auto transition-all duration-300 ease-in-out">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {searchResults.length === 0 && <Welcome />}

              {/* Mostrar resultados por término */}
              {searchResults.map((result, termIndex) => (
                <div key={termIndex} className="mt-6">
                  <h2 className="text-lg font-bold text-blue-500 mb-4">
                    {result.productoBuscado}:
                  </h2>

                  {/* Productos Combinados */}
                  <ul className="flex flex-wrap mt-4">
                    {(result.productosCombinados || [])
                      .slice(0, expandedTerms[termIndex] ? result.productosCombinados.length : 6)
                      .map((producto, index) => (
                        <li
                          key={index}
                          className={`mb-4 mr-4 flex-shrink-0 w-1/4 p-2 rounded-lg shadow-md transform transition-transform duration-200 ease-in-out cursor-pointer ${
                            selectedProducts.includes(producto.SKU)
                              ? 'bg-blue-100 border-2 border-blue-500 shadow-lg'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                          onClick={() => handleProductSelection(producto.SKU, producto.Costo)}
                        >
                          <div className="relative">
                            {selectedProducts.includes(producto.SKU) && (
                              <span className="absolute top-0 right-0 bg-blue-500 text-white rounded-full p-1 shadow-md w-6 h-6 flex items-center justify-center">
                                ✓
                              </span>
                            )}
                            <div className="text-sm font-bold">{producto.Nombre}</div>
                            <div className="text-sm"><strong>Marca:</strong> {producto.Marca}</div>
                            <div className="text-sm italic">SKU: {producto.SKU}</div>
                            <div className="text-sm font-semibold text-green-500">
                              ${producto.Costo || '0'}
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>

                  {result.productosCombinados.length > 6 && (
                    <div className="mt-4 text-center">
                      <button
                        className="text-blue-600 font-semibold hover:underline"
                        onClick={() => toggleExpanded(termIndex)}
                      >
                        {expandedTerms[termIndex] ? 'Mostrar Menos' : 'Mostrar Más'}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {searchResults.length > 0 && (
                <div className="mt-6">
                  <div className="text-lg font-bold mb-4">
                    Precio Total: ${totalPrice}
                  </div>
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

      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      <ChatWidget />
    </div>
  );
}

export default App;