import React, { useState } from 'react';

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage = inputValue;
    setMessages([...messages, { sender: 'user', text: userMessage }]);
    setInputValue('');
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
        const formattedMessage = formatMessage(data.respuesta_modelo);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: formattedMessage },
        ]);
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Error al obtener respuesta. Por favor, intenta de nuevo.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (message) => {
    const items = message.split('-').filter(item => item.trim() !== '');
    return (
      <ul className="list-disc list-inside">
        {items.map((item, index) => (
          <li key={index}>{item.trim()}</li>
        ))}
      </ul>
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
              {typeof msg.text === 'string' ? msg.text : msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-gray-500 mt-4">
            <span className="loader inline-block w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
            <span className="ml-2">El BOB IA está escribiendo...</span>
          </div>
        )}
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