import React, { useState } from 'react';

function ChatWindow({ selectedChat }) {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      // Aquí puedes manejar el envío del mensaje, por ejemplo, agregándolo al historial
      selectedChat.messages.push({ text: message, isUser: true });
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 bg-white overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{selectedChat.name}</h2>
        <div className="chat-messages">
          {selectedChat.messages.map((message, index) => (
            <div key={index} className={`mb-2 ${message.isUser ? 'text-right' : 'text-left'}`}>
              <p className="inline-block p-2 bg-gray-200 rounded-lg max-w-xs break-words">{message.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-gray-300 bg-gray-100 flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-lg mr-2"
          placeholder="Escribe un mensaje..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;