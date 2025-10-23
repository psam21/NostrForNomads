import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Flame } from "lucide-react";

interface Burner {
  id: string;
  name: string;
  pubkey: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

interface BurnersListProps {
  burners: Burner[];
  onSelectBurner: (burnerId: string) => void;
  selectedBurnerId?: string;
}

export function BurnersList({ burners, onSelectBurner, selectedBurnerId }: BurnersListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-orange-50 border-b border-orange-200">
        <div className="flex items-center gap-2 text-orange-700">
          <Flame className="h-4 w-4" />
          <p className="text-sm">
            Temporary chats you can end anytime
          </p>
        </div>
      </div>

      {burners.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Flame className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-muted-foreground mb-2">No Burner Chats</h3>
          <p className="text-sm text-muted-foreground">
            Start a disposable chat you can delete anytime
          </p>
        </div>
      ) : (
        burners.map((burner) => {
          return (
            <button
              key={burner.id}
              onClick={() => onSelectBurner(burner.id)}
              className={`flex items-start gap-3 p-4 border-b border-border hover:bg-accent/50 transition-colors text-left ${
                selectedBurnerId === burner.id ? 'bg-accent' : ''
              }`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={burner.avatar} alt={burner.name} />
                  <AvatarFallback className="bg-orange-500 text-white">
                    {burner.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <Flame className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="truncate">{burner.name}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(burner.timestamp, { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground truncate mb-1">
                  {burner.lastMessage}
                </p>
                
                <p className="text-xs text-muted-foreground/70 truncate font-mono">
                  {burner.pubkey.slice(0, 16)}...
                </p>
              </div>
              
              {burner.unread > 0 && (
                <Badge className="bg-orange-500 hover:bg-orange-600 ml-2 mt-1">
                  {burner.unread}
                </Badge>
              )}
            </button>
          );
        })
      )}
    </div>
  );
}
