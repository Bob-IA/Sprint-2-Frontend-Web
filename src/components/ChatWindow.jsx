import React, { useState } from 'react';

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage = inputValue;
    setMessages([...messages, { sender: 'user', text: userMessage }]);
    setInputValue('');
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://ms-chat.tssw.cl/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mensaje: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.respuesta_modelo) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: data.respuesta_modelo },
        ]);
      }

      if (data.resultados_busqueda && data.resultados_busqueda.length > 0) {
        const resultados = data.resultados_busqueda.map((resultado) => {
          const productosExactos = resultado.productos_exactos || [];
          const productosSimilares = resultado.productos_similares || [];
          const productosMapeados = [...productosExactos, ...productosSimilares].map((producto) => ({
            SKU: producto.SKU || producto.sku || 'SKU no disponible',
            nombre: producto.Nombre || producto.nombre_producto || 'Nombre no disponible',
            marca: producto.Marca || producto.marca || 'Marca no disponible',
            categoria: producto.Categoria || producto.categoria || 'Categoría no especificada',
            costo: parseInt(producto.Costo || 0, 10), // Asegurar que el costo sea un entero
          }));
          return {
            productoBuscado: resultado.producto_buscado,
            productos: productosMapeados,
          };
        });

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: 'Resultados de búsqueda:', resultados },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: 'No se encontraron productos en la búsqueda.' },
        ]);
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setErrorMessage('Error al comunicarse con el servidor. Verifica tu conexión.');
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Error al obtener respuesta. Por favor, intenta de nuevo.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelection = (sku) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(sku)
        ? prevSelected.filter((item) => item !== sku)
        : [...prevSelected, sku]
    );
  };

  return (
    <div className="fixed bottom-20 right-10 bg-white w-96 h-[550px] rounded-lg shadow-xl flex flex-col z-50">
      <div className="flex justify-between items-center bg-blue-600 text-white p-6 rounded-t-lg">
        <h2 className="text-xl font-bold">Asistente Virtual BOB IA</h2>
        <button onClick={onClose} className="text-white font-bold text-2xl">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && (
          <div className="text-gray-500 text-center p-4">
            Bienvenido al chat de BOB IA
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.text}
            </div>
            {msg.resultados && msg.resultados.map((resultado, resIndex) => (
              <div key={resIndex} className="mt-4">
                <h3 className="text-lg font-semibold text-blue-500 mb-2">
                  {resultado.productoBuscado}:
                </h3>
                <ProductList productos={resultado.productos} handleProductSelection={handleProductSelection} selectedProducts={selectedProducts} />
              </div>
            ))}
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-gray-500 mt-4">
            <span className="loader inline-block w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
            <span className="ml-2">El BOB IA está escribiendo...</span>
          </div>
        )}
        {errorMessage && <div className="text-red-500 text-center p-2">{errorMessage}</div>}
      </div>
      <div className="p-6 flex items-center border-t border-gray-300">
        <input
          type="text"
          className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Escribe un mensaje..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="ml-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

const ProductList = ({ productos, handleProductSelection, selectedProducts }) => {
  const [showAll, setShowAll] = useState(false);
  const visibleProductos = showAll ? productos : productos.slice(0, 6);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        {visibleProductos.map((producto, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105 ${
              selectedProducts.includes(producto.SKU) ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
            }`}
            onClick={() => handleProductSelection(producto.SKU)}
          >
            <h3 className="text-sm font-bold">{producto.nombre}</h3>
            <p className="text-xs"><strong>Marca:</strong> {producto.marca}</p>
            <p className="text-xs"><strong>Categoría:</strong> {producto.categoria}</p>
            <p className="text-xs italic"><strong>SKU:</strong> {producto.SKU}</p>
            <p className="text-xs font-semibold text-green-500"><strong>Precio:</strong> ${producto.costo}</p>
          </div>
        ))}
      </div>
      {productos.length > 6 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 font-semibold hover:underline"
          >
            {showAll ? 'Mostrar menos' : 'Mostrar más'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;