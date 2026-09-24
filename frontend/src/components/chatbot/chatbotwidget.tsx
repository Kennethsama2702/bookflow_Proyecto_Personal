import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, X, Send } from "lucide-react";
import MessageBubble from "../chat/messagebubble";
import { useLocalChatHistory } from "../chat/uselocalchathistory";
import type { ChatMessage } from "../chat/types";
import type { UserRole } from "../../api";
import "./chatbotwidget.css";

interface Props {
  fullName: string;
  role?: UserRole;
}

const CLIENT_REPLIES = [
  "Puedo ayudarte a descubrir una película, comparar horarios o buscar la función con más asientos disponibles.",
  "Prueba preguntarme: ¿qué película ver?, ¿qué función está más vacía? o ¿qué combos hay hoy?",
];

const OPERATIONS_REPLIES = [
  "Puedo consultar ocupación, ventas y rendimiento por sede cuando conectemos los datos analíticos del backend.",
  "Prueba preguntarme por porcentaje de ocupación, ventas de la semana o funciones con menor asistencia.",
];

export default function ChatbotWidget({ fullName, role = "CLIENTE" }: Props) {
  const [open, setOpen] = useState(false);
  const firstName = fullName.split(" ")[0];
  const analyticsAssistant = role === "ADMINISTRADOR" || role === "SUPERVISOR";

  const initialMessage: ChatMessage = {
    id: "welcome",
    from: "bot",
    text: !analyticsAssistant
      ? `¿No sabes qué película ver, ${firstName}? Puedo ayudarte a encontrar horario y sala.`
      : `¿Qué indicador necesitas revisar hoy, ${firstName}? Puedo ayudarte con analítica operativa.`,
    timestamp: Date.now(),
  };
  const { messages, addMessage } = useLocalChatHistory(
    `chatbot-widget-${role}-${fullName}`,
    initialMessage,
  );
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    addMessage({
      id: crypto.randomUUID(),
      from: "user",
      text: input.trim(),
      timestamp: Date.now(),
    });
    setInput("");
    setTimeout(() => {
      addMessage({
        id: crypto.randomUUID(),
        from: "bot",
        text: (analyticsAssistant ? OPERATIONS_REPLIES : CLIENT_REPLIES)[
          Math.floor(Math.random() * 2)
        ],
        timestamp: Date.now(),
      });
    }, 700);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="chatbot-window"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18 }}
          >
            <div className="chatbot-window-header">
              <Bot size={18} />
              <span>Asistente Cinefilo</span>
            </div>

            <div className="chatbot-window-messages" ref={listRef}>
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </div>

            <form className="chatbot-window-input" onSubmit={handleSend}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
              />
              <button type="submit">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="chatbot-fab"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
      >
        {open ? <X size={24} /> : <Bot size={24} />}
      </motion.button>
    </>
  );
}
