import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Chat {
  id: string;
  name: string;
  pubkey: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  online?: boolean;
}

interface ChatListProps {
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
}

export function ChatList({ chats, onSelectChat, selectedChatId }: ChatListProps) {
  return (
    <div className="flex flex-col h-full">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          className={`flex items-start gap-3 p-4 border-b border-border hover:bg-accent/50 transition-colors text-left ${
            selectedChatId === chat.id ? 'bg-accent' : ''
          }`}
        >
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={chat.avatar} alt={chat.name} />
              <AvatarFallback className="bg-purple-600 text-white">
                {chat.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {chat.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="truncate">{chat.name}</h3>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(chat.timestamp, { addSuffix: true })}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground truncate mb-1">
              {chat.lastMessage}
            </p>
            
            <p className="text-xs text-muted-foreground/70 truncate font-mono">
              {chat.pubkey.slice(0, 16)}...
            </p>
          </div>
          
          {chat.unread > 0 && (
            <Badge className="bg-purple-600 hover:bg-purple-700 ml-2 mt-1">
              {chat.unread}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
