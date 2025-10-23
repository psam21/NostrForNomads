import { formatDistanceToNow } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isSent: boolean;
  isDelivered?: boolean;
  isRead?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`flex ${message.isSent ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          message.isSent
            ? 'bg-purple-600 text-white rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}
      >
        <p className="break-words">{message.content}</p>
        <div className={`flex items-center gap-1 mt-1 text-xs ${
          message.isSent ? 'text-purple-100 justify-end' : 'text-muted-foreground'
        }`}>
          <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
          {message.isSent && (
            <span className="ml-1">
              {message.isRead ? (
                <CheckCheck className="h-3 w-3 text-blue-300" />
              ) : message.isDelivered ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
