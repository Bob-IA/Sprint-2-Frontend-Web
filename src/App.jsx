import React, { useState } from 'react';
import TopBar from './components/TopBar';
import ChatHistory from './components/ChatHistory';
import ChatWindow from './components/ChatWindow';

function App() {
  const user = {
    name: 'Aburik',
    email: 'Babarca@example.com',
    avatar: 'https://pbs.twimg.com/media/GWMCvhMXsAAvXl8?format=jpg&name=medium'  // URL de un avatar de ejemplo
  };

  const [chatHistory, setChatHistory] = useState([
    {
      name: 'Materiales',
      messages: [
        { text: 'Hola, estoy trabajando en un proyecto de renovación y necesito saber cuál es el mejor tipo de concreto para una estructura en una zona con alta humedad.', isUser: true },
        { text: '¡Hola! Para una estructura en una zona con alta humedad, te recomendaría usar concreto de alta resistencia con aditivos impermeabilizantes. Este tipo de concreto está diseñado para reducir la permeabilidad y proteger contra la humedad. ¿Te gustaría obtener más información sobre los aditivos específicos que podrías usar?', isUser: false },
      ],
    },
    {
      name: 'Chat ejemploo',
      messages: [
        { text: 'Holaaa', isUser: true },
        { text: 'bien si', isUser: false },
      ],
    },
  ]);

  const [selectedChatIndex, setSelectedChatIndex] = useState(0);

  const handleSendMessage = (message) => {
    const newChatHistory = [...chatHistory];
    newChatHistory[selectedChatIndex].messages.push({ text: message, isUser: true });
    setChatHistory(newChatHistory);
  };

  const handleChatSelect = (index) => {
    setSelectedChatIndex(index);
  };

  return (
    <div className="h-screen flex flex-col">
      <TopBar user={user} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 bg-gray-100">
          <ChatHistory history={chatHistory} onChatSelect={handleChatSelect} />
        </div>
        <div className="w-3/4 bg-white">
          <ChatWindow 
            selectedChat={chatHistory[selectedChatIndex]} 
            onSendMessage={handleSendMessage} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;
