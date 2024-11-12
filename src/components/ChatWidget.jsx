import React, { useState } from 'react';
import { FaComments } from 'react-icons/fa';
import ChatWindow from './ChatWindow';

const ChatWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {!isChatOpen && (
        <div
          className="fixed bottom-10 right-10 bg-blue-600 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all duration-300 z-50"
          style={{ width: '80px', height: '80px' }}
          onClick={() => setIsChatOpen(true)}
        >
          <FaComments size={40} className="mx-auto" />
        </div>
      )}

      {isChatOpen && (
        <ChatWindow onClose={() => setIsChatOpen(false)} />
      )}
    </>
  );
};

export default ChatWidget;
