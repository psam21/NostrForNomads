import { MessageCircle, Flame } from "lucide-react";

interface BottomNavProps {
  activeTab: 'chats' | 'burners';
  onTabChange: (tab: 'chats' | 'burners') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="flex items-center border-t border-border bg-background">
      <button
        onClick={() => onTabChange('chats')}
        className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
          activeTab === 'chats' 
            ? 'text-purple-600' 
            : 'text-muted-foreground'
        }`}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-xs">Chats</span>
      </button>
      
      <button
        onClick={() => onTabChange('burners')}
        className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
          activeTab === 'burners' 
            ? 'text-orange-500' 
            : 'text-muted-foreground'
        }`}
      >
        <Flame className="h-5 w-5" />
        <span className="text-xs">Burners</span>
      </button>
    </div>
  );
}
