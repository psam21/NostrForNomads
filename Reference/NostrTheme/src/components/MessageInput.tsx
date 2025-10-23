import { useState } from "react";
import { Send, Smile } from "lucide-react";
import { Button } from "./ui/button";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 border-t border-border bg-background">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mb-1 text-muted-foreground hover:text-foreground"
      >
        <Smile className="h-5 w-5" />
      </Button>
      
      <div className="flex-1 bg-muted rounded-3xl px-4 py-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Type a message..."
          className="w-full bg-transparent resize-none outline-none max-h-24"
          rows={1}
        />
      </div>
      
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim()}
        className="bg-purple-600 hover:bg-purple-700 rounded-full h-10 w-10 mb-1"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}
