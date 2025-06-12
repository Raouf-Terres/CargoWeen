import { useState, useEffect } from "react";
import { PaperAirplaneIcon, PaperClipIcon } from "@heroicons/react/24/solid";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [fileBase64, setFileBase64] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem("chat_history")) || [];
    const firstMessage = {
      from: "bot",
      text: "Bonjour ! Je suis un agent spécialisé dans la logistique et le fret aérien. Comment puis-je vous aider aujourd'hui ?"
    };
    setMessages(savedMessages.length ? savedMessages : [firstMessage]);
    const timer = setTimeout(() => setShowWelcome(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages));
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(",")[1];
      setFileBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");
    setLoading(true);
    setIsTyping(true);
    const payload = { message: input };
    if (fileBase64 && fileName) {
      payload.document = fileBase64;
      payload.document_name = fileName;
    }
    try {
      const res = await fetch("https://43qqftn47b.execute-api.us-east-1.amazonaws.com/dev/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setTimeout(() => {
          setMessages((prev) => [...prev, { from: "bot", text: data.response }]);
          setIsTyping(false);
        }, 1200);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: `Erreur API: ${data.error || "Réponse invalide"}` },
        ]);
        setIsTyping(false);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "L'agent ne peut répondre à cette question." },
      ]);
      setIsTyping(false);
    } finally {
      setLoading(false);
      setFileBase64(null);
      setFileName("");
    }
  };

  return (
    <>
      <div className="chatbot-icon" onClick={() => setIsOpen(!isOpen)}>
        <img src="/essai-icon-chatbot.png" alt="Chatbot" />
        {showWelcome && (<div className="welcome-popup animated-popup">
    👋 Bonjour <strong>Yessine</strong> !
  </div>)}
      </div>

      {isOpen && (
        <div className="chat-container fade-in">
          <div className="chat-header">
            <img src="/essai-icon-chatbot.png" className="header-icon" alt="Bot" />
            <span>CargoWeen Agent</span>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message-line ${msg.from}`}>
                {msg.from === "bot" && <img src="/chatbot-con2.png" className="icon-bot-left" alt="Bot Icon" />}
                <div className={`chat-bubble ${msg.from}`}>{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="message-line bot">
                <div className="chat-bubble bot">La réponse est en cours ...</div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <label className="icon-button left-icon" title="Joindre un fichier">
              <PaperClipIcon className="h-5 w-5 text-white" />
              <input type="file" hidden onChange={handleFileChange} disabled={loading} />
            </label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrire un message..."
              type="text"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
            />
            <button onClick={handleSend} className="icon-button right-icon" title="Envoyer" disabled={loading}>
              <PaperAirplaneIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        * {
          font-family: Arial, sans-serif;
        }

        .chatbot-icon {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          cursor: pointer;
        }

        .chatbot-icon img {
          width: 80px;
          height: 80px;
        }

        .welcome-popup {
          position: absolute;
          bottom: 70px;
          right: 0;
          background: rgba(63, 101, 146, 0.9);
          color: #fff;
          padding: 10px 16px;
          border-radius: 20px;
          font-size: 15px;
          font-weight: 500;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
          white-space: nowrap;
          animation: popupZoomIn 0.4s ease-out, floating 2s ease-in-out infinite;
          backdrop-filter: blur(4px);
          z-index: 1001;
        }

        .fade-in {
          animation: appear 0.3s ease-in-out forwards;
        }

        @keyframes appear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-container {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 95%;
          max-width: 400px;
          max-height: 80vh;
          background: white;
          border: 3px solid #3F6592;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .chat-header {
          background-color: #3F6592;
          color: white;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .header-icon {
          width: 24px;
          height: 24px;
        }

        .close-btn {
          background: transparent;
          border: none;
          font-size: 20px;
          color: white;
          cursor: pointer;
          margin-left: auto;
        }

        .chat-messages {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .message-line {
          display: flex;
          align-items: flex-end;
          gap: 6px;
        }

        .message-line.user {
          justify-content: flex-end;
        }

        .chat-bubble {
          padding: 10px 14px;
          border-radius: 16px;
          max-width: 80%;
          word-wrap: break-word;
        }

        .chat-bubble.user {
          background-color: #e0e0e0;
          color: black;
          border-top-right-radius: 0;
        }

        .chat-bubble.bot {
          background-color: #3F6592;
          color: white;
          border-top-left-radius: 0;
        }

        .icon-bot-left {
          width: 20px;
          height: 20px;
        }

        .chat-input {
          position: relative;
          padding: 12px;
          background: #f9f9f9;
          display: flex;
          align-items: center;
          border-top: 1px solid #ddd;
        }

        .chat-input input[type="text"] {
          flex: 1;
          padding: 14px 48px;
          border-radius: 30px;
          border: 1px solid #ccc;
          outline: none;
          font-size: 15px;
          background-color: white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        .icon-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: #3F6592;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          cursor: pointer;
        }

        .icon-button:hover {
          background-color: #2d4d73;
        }

        .left-icon {
          left: 12px;
        }

        .right-icon {
          right: 12px;
        }

        @keyframes popupZoomIn {
          0% {
            opacity: 0;
            transform: scale(0.7) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes floating {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0);
          }
        }


        @media (max-width: 480px) {
          .chat-container {
            bottom: 80px;
            right: 10px;
            width: 95vw;
            max-height: 80vh;
          }
        }
      `}</style>
    </>
  );
}
