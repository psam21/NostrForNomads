import { useState } from "react";
import { ChatList } from "./components/ChatList";
import { ChatView } from "./components/ChatView";
import { BurnersList } from "./components/BurnersList";
import { BottomNav } from "./components/BottomNav";
import { Settings, User } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

// Mock user data
const currentUser = {
  name: "John",
  pubkey: "npub1john5k4j3h2g1f0e9d8c7b6a5z4y3x2w1v0u9t8s7r6q5p4",
};

// Mock data
const mockChats = [
  {
    id: "1",
    name: "Alice",
    pubkey: "npub1alice3k9j2h8f7g6d5s4a3z2x1c9v8b7n6m5k4j3h2g1f0",
    avatar: undefined,
    lastMessage: "Hey! Did you see the latest relay updates?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Bob",
    pubkey: "npub1bob9x8y7z6a5b4c3d2e1f0g9h8i7j6k5l4m3n2o1p0",
    avatar: undefined,
    lastMessage: "Thanks for the zap! ⚡",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    unread: 0,
    online: true,
  },
  {
    id: "3",
    name: "Carol",
    pubkey: "npub1carol7m6n5o4p3q2r1s0t9u8v7w6x5y4z3a2b1c0",
    avatar: undefined,
    lastMessage: "The decentralized future is here 🚀",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unread: 0,
    online: false,
  },
  {
    id: "4",
    name: "Dave",
    pubkey: "npub1dave5k4j3h2g1f0e9d8c7b6a5z4y3x2w1v0u9t8",
    avatar: undefined,
    lastMessage: "Connected to 5 relays now",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unread: 1,
    online: false,
  },
];

const mockMessages = {
  "1": [
    {
      id: "1",
      content: "Hey! How's it going?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isSent: false,
    },
    {
      id: "2",
      content: "Going great! Just testing out this new Nostr client.",
      timestamp: new Date(Date.now() - 1000 * 60 * 55),
      isSent: true,
      isDelivered: true,
      isRead: true,
    },
    {
      id: "3",
      content: "That's awesome! I love how decentralized it is.",
      timestamp: new Date(Date.now() - 1000 * 60 * 50),
      isSent: false,
    },
    {
      id: "4",
      content: "Yeah, the censorship resistance is a game changer. No single point of failure!",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      isSent: true,
      isDelivered: true,
      isRead: true,
    },
    {
      id: "5",
      content: "Hey! Did you see the latest relay updates?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      isSent: false,
    },
  ],
  "2": [
    {
      id: "1",
      content: "Just sent you a small zap! ⚡",
      timestamp: new Date(Date.now() - 1000 * 60 * 35),
      isSent: true,
      isDelivered: true,
      isRead: true,
    },
    {
      id: "2",
      content: "Thanks for the zap! ⚡",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isSent: false,
    },
  ],
  "3": [
    {
      id: "1",
      content: "The decentralized future is here 🚀",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isSent: false,
    },
  ],
  "4": [
    {
      id: "1",
      content: "Connected to 5 relays now",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isSent: false,
    },
  ],
};

// Mock burner chats - temporary chats that can be ended anytime
const mockBurners = [
  {
    id: "b1",
    name: "Anonymous User",
    pubkey: "npub1anon5k4j3h2g1f0e9d8c7b6a5z4y3x2w1v0u9t8s7r6",
    avatar: undefined,
    lastMessage: "This message will self-destruct...",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    unread: 1,
  },
  {
    id: "b2",
    name: "Quick Chat",
    pubkey: "npub1quick7m6n5o4p3q2r1s0t9u8v7w6x5y4z3a2b1c",
    avatar: undefined,
    lastMessage: "Thanks for the quick sync! 🔥",
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    unread: 0,
  },
  {
    id: "b3",
    name: "Temp Contact",
    pubkey: "npub1temp9x8y7z6a5b4c3d2e1f0g9h8i7j6k5l4m3n2o",
    avatar: undefined,
    lastMessage: "Let's keep this private",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20), // 20 hours ago
    unread: 0,
  },
];

export default function App() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chats' | 'burners'>('chats');
  const [chats, setChats] = useState(mockChats);
  const [burners, setBurners] = useState(mockBurners);
  const [messages, setMessages] = useState(mockMessages);
  const [npubInput, setNpubInput] = useState("");

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const selectedBurner = burners.find((burner) => burner.id === selectedChatId);
  const selectedItem = selectedChat || selectedBurner;
  const currentMessages = selectedChatId ? messages[selectedChatId] || [] : [];

  const handleSendMessage = (content: string) => {
    if (!selectedChatId) return;

    const newMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      isSent: true,
      isDelivered: true,
      isRead: false,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMessage],
    }));

    // Update last message in chat list (for both regular chats and burners)
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChatId
          ? { ...chat, lastMessage: content, timestamp: new Date() }
          : chat
      )
    );

    setBurners((prev) =>
      prev.map((burner) =>
        burner.id === selectedChatId
          ? { ...burner, lastMessage: content, timestamp: new Date() }
          : burner
      )
    );
  };

  const handleEndChat = () => {
    if (!selectedChatId) return;

    // Remove burner from list
    setBurners((prev) => prev.filter((burner) => burner.id !== selectedChatId));

    // Remove messages
    setMessages((prev) => {
      const newMessages = { ...prev };
      delete newMessages[selectedChatId];
      return newMessages;
    });

    // Go back to list
    setSelectedChatId(null);
  };

  const generateRandomNpub = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let npub = 'npub1';
    for (let i = 0; i < 50; i++) {
      npub += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return npub;
  };

  const handleNpubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'burners') {
      // Generate a disposable burner chat
      const generatedNpub = generateRandomNpub();
      const newBurner = {
        id: Date.now().toString(),
        name: "Anonymous " + Math.floor(Math.random() * 9999),
        pubkey: generatedNpub,
        avatar: undefined,
        lastMessage: "Start a disposable conversation",
        timestamp: new Date(),
        unread: 0,
      };
      setBurners([newBurner, ...burners]);
      setSelectedChatId(newBurner.id);
      setNpubInput("");
    } else if (npubInput.trim().startsWith('npub')) {
      // Create a new chat with the entered npub
      const newChat = {
        id: Date.now().toString(),
        name: npubInput.slice(0, 16) + "...",
        pubkey: npubInput,
        avatar: undefined,
        lastMessage: "Start a conversation",
        timestamp: new Date(),
        unread: 0,
        online: false,
      };
      setChats([newChat, ...chats]);
      setSelectedChatId(newChat.id);
      setNpubInput("");
    }
  };

  if (selectedItem) {
    const isBurner = !!selectedBurner;
    
    return (
      <div className="h-screen w-full max-w-md mx-auto bg-background">
        <ChatView
          chatId={selectedItem.id}
          name={selectedItem.name}
          avatar={selectedItem.avatar}
          pubkey={selectedItem.pubkey}
          messages={currentMessages}
          onBack={() => setSelectedChatId(null)}
          onSendMessage={handleSendMessage}
          onEndChat={isBurner ? handleEndChat : undefined}
          isBurner={isBurner}
          relayStatus="connected"
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-background flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-3 p-4 border-b border-border bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <h1>{currentUser.name}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-purple-500/30"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleNpubSubmit} className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
          <Input
            type="text"
            placeholder={activeTab === 'burners' ? "Enter npub to chat using disposable nsec" : "Enter npub to chat"}
            value={npubInput}
            onChange={(e) => setNpubInput(e.target.value)}
            className="pl-10 bg-purple-500/30 border-purple-400/30 text-white placeholder:text-purple-200"
          />
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' ? (
          <ChatList
            chats={chats}
            onSelectChat={setSelectedChatId}
            selectedChatId={selectedChatId || undefined}
          />
        ) : (
          <BurnersList 
            burners={burners}
            onSelectBurner={setSelectedChatId}
            selectedBurnerId={selectedChatId || undefined}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
