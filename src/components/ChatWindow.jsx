import React, { useState } from 'react';

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage = inputValue;
    setMessages([...messages, { sender: 'user', text: userMessage }]);
    setInputValue('');
    setErrorMessage(''); // Resetear cualquier mensaje de error previo

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
        const resultados = data.resultados_busqueda.map((producto, index) => ({
          SKU: producto.SKU || 'SKU no disponible',
          nombre: producto.nombre_producto || 'Nombre no disponible',
          marca: producto.Marca || 'Marca no disponible',
          disponibilidad: producto.disponibilidad || 'Disponibilidad no especificada',
          precio: producto.precio ? `$${producto.precio}` : 'Precio no especificado',
        }));

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: 'Resultados de búsqueda:', productos: resultados },
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
        <h2 className="text-xl font-bold">Asistente Virtual</h2>
        <button onClick={onClose} className="text-white font-bold text-2xl">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.text}
            </div>
            {msg.productos && (
              <ul className="flex flex-wrap mt-4">
                {msg.productos.map((producto, idx) => (
                  <li
                    key={idx}
                    className={`mb-4 mr-4 flex-shrink-0 w-1/4 p-2 rounded-lg shadow-md transform transition-transform duration-200 ease-in-out cursor-pointer ${
                      selectedProducts.includes(producto.SKU)
                        ? 'bg-blue-100 border-2 border-blue-500 shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => handleProductSelection(producto.SKU)}
                  >
                    <div className="text-sm font-bold">{producto.nombre}</div>
                    <div className="text-sm"><strong>Marca:</strong> {producto.marca}</div>
                    <div className="text-sm italic">SKU: {producto.SKU}</div>
                    <div className="text-sm">{producto.disponibilidad}</div>
                    <div className="text-sm font-semibold">{producto.precio}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
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

export default ChatWindow;
