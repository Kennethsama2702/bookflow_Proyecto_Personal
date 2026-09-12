export interface ChatMessage {
  id: string;
  from: "user" | "bot";
  text: string;
  timestamp: number;
}
