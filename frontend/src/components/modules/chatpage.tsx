import { useState } from "react";
import { Send } from "lucide-react";
import MessageBubble from "../chat/messagebubble";
import { useLocalChatHistory } from "../chat/uselocalchathistory";
import type { ChatMessage } from "../chat/types";
import "./chatpage.css";

interface Props {
  fullName: string;
}

// Placeholder -- cuando exista el módulo de bookings, esta lista de "salas"
// vendrá de los recursos/reservas reales del usuario, no hardcodeada así.
const ROOMS = [
  { id: "sala-a", name: "Sala A" },
  { id: "sala-b", name: "Sala B" },
  { id: "cancha-1", name: "Cancha 1" },
];

function initialsOf(name: string) {
  return name.charAt(0).toUpperCase();
}

export default function ChatPage({ fullName }: Props) {
  const [activeRoom, setActiveRoom] = useState(ROOMS[0].id);
  const firstName = fullName.split(" ")[0];
  const activeRoomName = ROOMS.find((r) => r.id === activeRoom)!.name;

  const initialMessage: ChatMessage = {
    id: "welcome",
    from: "bot",
    text: `Aún no hay mensajes en esta sala, ${firstName}. El historial real se guardará cuando conectemos el backend de chat (Socket.IO).`,
    timestamp: Date.now(),
  };
  const { messages, addMessage } = useLocalChatHistory(
    `chat-room-${activeRoom}`,
    initialMessage,
  );
  const [input, setInput] = useState("");

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
  }

  return (
    <div className="page">
      <h1>Chat</h1>
      <p className="page-subtitle">
        Interfaz lista -- se conecta al backend de Socket.IO más adelante.
      </p>

      <div className="chat-layout">
        <aside className="chat-rooms">
          {ROOMS.map((room) => {
            const roomMessages: ChatMessage[] =
              JSON.parse(
                localStorage.getItem(`chat-room-${room.id}`) || "null",
              ) || [];
            const last = roomMessages[roomMessages.length - 1];
            return (
              <button
                key={room.id}
                className={`chat-room-item ${activeRoom === room.id ? "active" : ""}`}
                onClick={() => setActiveRoom(room.id)}
              >
                <span className="chat-room-avatar">
                  {initialsOf(room.name)}
                </span>
                <span className="chat-room-info">
                  <span className="chat-room-name">{room.name}</span>
                  <span className="chat-room-preview">
                    {last ? last.text : "Sin mensajes aún"}
                  </span>
                </span>
              </button>
            );
          })}
        </aside>

        <div className="chat-thread">
          <div className="chat-thread-header">
            <span className="chat-room-avatar">
              {initialsOf(activeRoomName)}
            </span>
            <span className="chat-thread-title">{activeRoomName}</span>
          </div>

          <div className="chat-thread-messages">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </div>
          <form className="chat-thread-input" onSubmit={handleSend}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
            />
            <button type="submit">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
