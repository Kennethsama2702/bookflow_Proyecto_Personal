import { useEffect, useState } from "react";
import type { ChatMessage } from "./types";

export function useLocalChatHistory(
  storageKey: string,
  initialMessage: ChatMessage,
) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    return [initialMessage];
  });

  // Sin este efecto, cambiar de storageKey (ej. cambiar de sala de chat) NO
  // reinicia el estado de "messages" -- React solo evalúa el inicializador de
  // useState una vez, en el primer montaje. Este efecto es el que de verdad
  // recarga el historial correcto cada vez que cambia la clave.
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setMessages(saved ? JSON.parse(saved) : [initialMessage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [storageKey, messages]);

  function addMessage(msg: ChatMessage) {
    setMessages((prev) => [...prev, msg]);
  }

  return { messages, addMessage };
}
