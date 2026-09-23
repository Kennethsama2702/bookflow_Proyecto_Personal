import type { ChatMessage } from "./types";
import "./messagebubble.css";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div
      className={`bubble-row ${message.from === "user" ? "from-user" : "from-bot"}`}
    >
      <div className="bubble">
        <p>{message.text}</p>
        <span className="bubble-time">{time}</span>
      </div>
    </div>
  );
}
