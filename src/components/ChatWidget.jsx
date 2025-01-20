import React, { useState } from "react";
import { FaComments } from "react-icons/fa";
import ChatWindow from "./ChatWindow";

const ChatWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Botón flotante para abrir el chat */}
      {!isChatOpen && (
        <div
          className="fixed bottom-10 right-10 bg-blue-600 text-white p-4 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all duration-300 z-50 chat-widget transform hover:scale-110 active:scale-95"
          style={{ width: "70px", height: "70px" }}
          onClick={() => setIsChatOpen(true)}
        >
          <FaComments size={35} className="mx-auto text-center animate-bounce" />
        </div>
      )}

      {/* Ventana de chat */}
      {isChatOpen && (
        <div className="fixed bottom-16 right-10 z-50 transform transition-all duration-500 ease-in-out">
          <ChatWindow onClose={() => setIsChatOpen(false)} />
        </div>
      )}

      {/* Fondo oscuro al abrir el chat */}
      {isChatOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
};

export default ChatWidget;
