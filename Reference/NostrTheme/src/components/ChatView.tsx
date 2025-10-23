import { ArrowLeft, MoreVertical, Wifi, Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "./ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isSent: boolean;
  isDelivered?: boolean;
  isRead?: boolean;
}

interface ChatViewProps {
  chatId: string;
  name: string;
  avatar?: string;
  pubkey: string;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (content: string) => void;
  onEndChat?: () => void;
  isBurner?: boolean;
  relayStatus?: 'connected' | 'connecting' | 'disconnected';
}

export function ChatView({
  name,
  avatar,
  pubkey,
  messages,
  onBack,
  onSendMessage,
  onEndChat,
  isBurner = false,
  relayStatus = 'connected'
}: ChatViewProps) {
  const [showEndChatDialog, setShowEndChatDialog] = useState(false);

  const handleEndChat = () => {
    setShowEndChatDialog(false);
    onEndChat?.();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-background sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className={isBurner ? "bg-orange-500 text-white" : "bg-purple-600 text-white"}>
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate">{name}</h2>
            {isBurner && <Flame className="h-4 w-4 text-orange-500" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Wifi className={`h-3 w-3 ${
              relayStatus === 'connected' ? 'text-green-500' : 
              relayStatus === 'connecting' ? 'text-yellow-500' : 
              'text-red-500'
            }`} />
            <span className="font-mono truncate">{pubkey.slice(0, 12)}...</span>
          </div>
        </div>
        
        {isBurner && onEndChat ? (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowEndChatDialog(true)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            End Chat
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <MoreVertical className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <MessageInput onSendMessage={onSendMessage} />

      {/* End Chat Dialog */}
      <AlertDialog open={showEndChatDialog} onOpenChange={setShowEndChatDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Burner Chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndChat}
              className="bg-orange-600 hover:bg-orange-700"
            >
              End Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
