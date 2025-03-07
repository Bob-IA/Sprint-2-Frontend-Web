import React, { useState } from "react";

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage = inputValue;
    setMessages([...messages, { sender: "user", text: userMessage }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("https://ms-chat.tssw.cl/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mensaje: userMessage }),
      });

      if (!response.ok) {
        throw new Error(
          `Error del servidor: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.respuesta_modelo) {
        const formattedMessage = formatMessage(data.respuesta_modelo);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: formattedMessage },
        ]);
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "bot",
          text: "Error al obtener respuesta. Por favor, intenta de nuevo.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Formato del mensaje con *
  const formatMessage = (message) => {
    const items = message.split("-").filter((item) => item.trim() !== "");
    return items.map((item) => `* ${item.trim()}`).join("\n");
  };

  return (
    <div className="fixed bottom-20 right-10 bg-white w-96 h-[550px] rounded-lg shadow-2xl flex flex-col z-50 transform transition-transform duration-300">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-bold">Asistente Virtual BOB IA</h2>
        <button
          onClick={onClose}
          className="text-white text-2xl font-bold hover:text-gray-300 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-gray-500 text-center">
            Bienvenido al chat de BOB IA. ¡Haz tu pregunta!
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            } relative`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              style={{ position: "relative" }}
            >
              <pre className="whitespace-pre-wrap">{msg.text}</pre>
            </div>
            {msg.sender === "bot" && (
              <button
                onClick={() => {
                  // Preparar texto para copiar: eliminar paréntesis y *
                  const textToCopy = msg.text
                    .replace(/\s*\([^)]*\)/g, "")  // Eliminar paréntesis y su contenido
                    .replace(/\* /g, "")           // Eliminar los *
                    .split("\n")                   // Separar líneas
                    .filter((item) => item.trim() !== "") // Filtrar líneas vacías
                    .join(", ");                   // Unir con comas
                  navigator.clipboard.writeText(textToCopy);
                  window.dispatchEvent(
                    new CustomEvent("searchFromChat", { detail: textToCopy })
                  );
                }}
                className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow hover:bg-blue-600 transition-all ml-2"
                style={{ alignSelf: "center" }}
              >
                Copiar y Buscar
              </button>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <span className="inline-block w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
            <span className="ml-2 text-gray-500">
              BOB IA está escribiendo...
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 flex items-center border-t border-gray-200">
        <input
          type="text"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Escribe un mensaje..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 active:scale-95 transition-all"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
