import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface Update {
  id: string;
  name: string;
  pubkey: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  reposts: number;
}

interface UpdatesListProps {
  updates: Update[];
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export function UpdatesList({ updates, onLoadMore, isLoading = false, hasMore = true }: UpdatesListProps) {
  return (
    <div className="flex flex-col">
      {updates.map((update) => (
        <div
          key={update.id}
          className="flex gap-3 p-4 border-b border-border hover:bg-accent/30 transition-colors"
        >
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={update.avatar} alt={update.name} />
            <AvatarFallback className="bg-purple-600 text-white">
              {update.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3>{update.name}</h3>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(update.timestamp, { addSuffix: true })}
              </span>
            </div>
            
            <p className="text-sm mb-2 whitespace-pre-wrap">{update.content}</p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <button className="hover:text-purple-600 transition-colors">
                💜 {update.likes}
              </button>
              <button className="hover:text-purple-600 transition-colors">
                🔄 {update.reposts}
              </button>
              <button className="hover:text-purple-600 transition-colors">
                ⚡ Zap
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {hasMore && onLoadMore && (
        <div className="p-4 flex justify-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
            className="w-full max-w-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading from relays...
              </>
            ) : (
              'Fetch More'
            )}
          </Button>
        </div>
      )}
      
      {!hasMore && updates.length > 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No more updates to load
        </div>
      )}
    </div>
  );
}
