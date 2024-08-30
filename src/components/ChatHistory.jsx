import React from 'react';

function ChatHistory({ history, onChatSelect }) {
  return (
    <div className="bg-white h-full border-r border-gray-300 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Historial de Chats</h2>
      <ul>
        {history.map((chat, index) => (
          <li 
            key={index} 
            className="mb-2 cursor-pointer"
            onClick={() => onChatSelect(index)}
          >
            <div className="text-blue-600 font-medium">{chat.name}</div>
            <div className="text-sm text-gray-600">{chat.lastMessage}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatHistory;
