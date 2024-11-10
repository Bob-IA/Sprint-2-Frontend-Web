import React, { useState } from 'react';

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage = inputValue;
    setMessages([...messages, { sender: 'user', text: userMessage }]);
    setInputValue('');

    try {
      const response = await fetch('https://ms-chat.tssw.cl/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mensaje: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Error al comunicarse con el servidor.');
      }

      const data = await response.json();
      const botResponse = data.respuesta_modelo;

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: botResponse },
      ]);
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: 'Error al obtener respuesta. Por favor, intenta de nuevo.' },
      ]);
    }
  };

  return (
    <div className="fixed bottom-20 right-8 bg-white w-80 h-96 rounded-lg shadow-lg flex flex-col z-50">
      <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-bold">Asistente Virtual</h2>
        <button onClick={onClose} className="text-white font-bold text-lg">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 flex items-center border-t border-gray-300">
        <input
          type="text"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Escribe un mensaje..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
