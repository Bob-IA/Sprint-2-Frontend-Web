import React, { useState } from 'react';
import { FaCommentDots } from 'react-icons/fa';
import ChatWindow from './ChatWindow';

const ChatWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {isChatOpen && <ChatWindow onClose={handleToggleChat} />}
      <button
        onClick={handleToggleChat}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-40"
      >
        <FaCommentDots className="text-2xl" />
      </button>
    </>
  );
};

export default ChatWidget;
