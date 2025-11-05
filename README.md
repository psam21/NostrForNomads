# Nostr for Nomads

**Your Hub for the Nomadic Lifestyle**

A decentralized platform built on the Nostr protocol, enabling digital nomads to connect, work, travel, and trade with full ownership of their identity and data.

---

## 🌟 Features

- **Gigs** - Decentralized job marketplace for freelancers and employers
- **Messages** - Encrypted, peer-to-peer messaging on Nostr
- **Meetings** - Video conferencing and virtual collaboration
- **Payments** - Bitcoin and Lightning Network transactions
- **Shop** - Decentralized marketplace for products and services
- **Travel** - Book accommodations, experiences, and transport

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.4.6** - React framework with App Router
- **React 19** - UI library with Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Nostr Integration
- **nostr-tools** - Nostr protocol implementation
- **NDK (Nostr Development Kit)** - Advanced Nostr functionality
- **WebSocket** - Real-time relay connections

### State Management
- **Zustand** - Lightweight state management
- **React Hooks** - Local component state

### Media & File Handling
- **Blossom Protocol** - Decentralized media storage
- **React Cropper** - Image editing and optimization

### Rich Text & Communication
- **Tiptap** - Extensible rich text editor
- **Markdown** - Content formatting

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Vercel Analytics** - Performance monitoring

---

## 🏛️ Architecture

### Service-Oriented Architecture (SOA)

The application follows a **layered Service-Oriented Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                   │
│  (Pages, Components, Hooks - User Interface)            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                   │
│         (Business Services - Domain Logic)               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                     CORE SERVICES LAYER                  │
│   (Infrastructure Services - Technical Capabilities)     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   PROTOCOL/DATA LAYER                    │
│      (Nostr Services, External APIs, Storage)            │
└─────────────────────────────────────────────────────────┘
```

### Layer Breakdown

#### 1. **Presentation Layer** (`/src/app`, `/src/components`, `/src/hooks`)
- **Responsibility**: User interface, routing, user interactions
- **Components**:
  - Pages (Next.js App Router)
  - Reusable UI components (primitives, pages, auth)
  - Custom React hooks for state and side effects
- **Key Principle**: Presentation components are thin and delegate business logic to services

#### 2. **Business Logic Layer** (`/src/services/business`)

Encapsulates domain-specific business rules and workflows:

- **AuthBusinessService**: Authentication flows, key management, sign-up/sign-in
- **MessagingBusinessService**: Message composition, threading, encryption
- **ProfileBusinessService**: Profile management, validation, updates
- **MediaBusinessService**: Media upload orchestration, Blossom integration
- **MessageCacheService**: Message caching strategies and optimization

**Key Characteristics**:
- Contains domain logic (e.g., "how to create a user profile")
- Orchestrates multiple core services
- Validates business rules
- Independent of UI frameworks

#### 3. **Core Services Layer** (`/src/services/core`)

Provides technical infrastructure capabilities:

- **EventLoggingService**: System event tracking and logging
- **KVService**: Key-value storage abstraction
- **LoggingService**: Application-wide logging
- **ProfileCacheService**: Profile data caching
- **CacheEncryptionService**: Encrypted cache management

**Key Characteristics**:
- Framework-agnostic utilities
- Reusable across different features
- Technical concerns (logging, caching, storage)
- No business domain knowledge

#### 4. **Protocol/Data Layer** (`/src/services/nostr`, `/src/services/generic`)

Handles external protocols and data sources:

- **GenericNostrService**: Core Nostr protocol operations
- **GenericEventService**: Nostr event creation and publishing
- **GenericRelayService**: WebSocket relay management
- **GenericBlossomService**: Blossom media protocol
- **GenericAuthService**: Cryptographic authentication
- **GenericHeritageService**: NIP-05 verification, metadata handling
- **EncryptionService**: NIP-04 encrypted messaging

**Key Characteristics**:
- Direct protocol implementation
- Network communication
- Data persistence
- External API integration

---

## 🔐 Service Segregation Principles

### 1. **Separation of Concerns**

Each service has a **single, well-defined responsibility**:

```typescript
// ❌ BAD: Mixed concerns
class MessageService {
  sendMessage() { /* business logic + Nostr protocol + UI updates */ }
}

// ✅ GOOD: Separated concerns
class MessagingBusinessService {
  async sendMessage(content: string) {
    // Business logic only
    const validated = this.validateMessage(content);
    const encrypted = await this.encryptionService.encrypt(validated);
    return this.nostrService.publishEvent(encrypted);
  }
}
```

### 2. **Dependency Injection**

Services depend on abstractions, not concrete implementations:

```typescript
// Business service depends on core service interface
class MessagingBusinessService {
  constructor(
    private nostrService: GenericNostrService,
    private encryptionService: EncryptionService,
    private cacheService: MessageCacheService
  ) {}
}
```

### 3. **Layered Dependencies**

**Strict dependency rules**:
- Presentation → Business Logic → Core Services → Protocol Layer
- **Never** reverse direction (e.g., Core cannot depend on Business)
- Horizontal communication within same layer is allowed

```
Page Component
    ↓ uses
MessagingBusinessService
    ↓ uses
GenericNostrService + EncryptionService
    ↓ uses
WebSocket API / Crypto API
```

### 4. **Service Isolation**

Each service is **independently testable** and **replaceable**:

```typescript
// Can mock dependencies for testing
const mockNostrService = { publishEvent: jest.fn() };
const messagingService = new MessagingBusinessService(mockNostrService);

// Can swap implementations without changing consumers
const realNostrService = new GenericNostrService();
const prodMessagingService = new MessagingBusinessService(realNostrService);
```

### 5. **State Management Segregation**

- **Zustand stores** (`/src/stores`): Global application state (auth, UI)
- **Service state**: Internal service state (connection pools, caches)
- **Component state**: Local UI state (forms, toggles)

```typescript
// Global auth state
useAuthStore() // Zustand

// Service manages its own connection state
GenericRelayService.relayConnections // Internal

// Component manages UI state
const [isOpen, setIsOpen] = useState(false) // Local
```

---

## 📁 Directory Structure

```
/src
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (event logging)
│   ├── gigs/              # Gigs marketplace page
│   ├── messages/          # Messaging page
│   ├── meetings/          # Video meetings page
│   ├── payments/          # Payment management page
│   ├── profile/           # User profile page
│   ├── shop/              # Shopping marketplace page
│   ├── travel/            # Travel booking page
│   ├── signin/            # Authentication page
│   ├── signup/            # Registration page
│   └── layout.tsx         # Root layout
│
├── components/            # React components
│   ├── auth/             # Authentication UI
│   ├── generic/          # Reusable components
│   ├── pages/            # Feature-specific components
│   ├── primitives/       # Base UI primitives
│   ├── profile/          # Profile-specific UI
│   └── ui/               # Common UI elements
│
├── hooks/                # Custom React hooks
│   ├── useAuthHydration.ts
│   ├── useConversations.ts
│   ├── useMessages.ts
│   ├── useNostrSigner.ts
│   └── useUserProfile.ts
│
├── services/             # Service layer (SOA)
│   ├── business/         # Business logic services
│   │   ├── AuthBusinessService.ts
│   │   ├── MessagingBusinessService.ts
│   │   ├── ProfileBusinessService.ts
│   │   └── MediaBusinessService.ts
│   │
│   ├── core/             # Infrastructure services
│   │   ├── EventLoggingService.ts
│   │   ├── KVService.ts
│   │   ├── LoggingService.ts
│   │   └── ProfileCacheService.ts
│   │
│   ├── generic/          # Generic utilities
│   │   ├── GenericAuthService.ts
│   │   ├── GenericBlossomService.ts
│   │   ├── GenericEventService.ts
│   │   └── EncryptionService.ts
│   │
│   └── nostr/            # Nostr protocol services
│
├── stores/               # Zustand state management
│   └── useAuthStore.ts
│
├── types/                # TypeScript type definitions
│   ├── attachments.ts
│   ├── messaging.ts
│   └── nostr.ts
│
├── utils/                # Utility functions
│   ├── keyManagement.ts
│   ├── signerFactory.ts
│   └── profileValidation.ts
│
├── config/               # Configuration files
│   ├── relays.ts
│   ├── blossom.ts
│   └── media.ts
│
├── errors/               # Error handling
│   ├── AppError.ts
│   └── ErrorTypes.ts
│
└── styles/               # Global styles
    ├── globals.css
    └── tiptap.css
```

---

## 🔄 Data Flow Example: Sending a Message

Demonstrates how SOA layers interact:

```typescript
// 1. USER INTERACTION (Presentation Layer)
// Component: MessageComposer.tsx
const handleSend = async () => {
  await messagingBusinessService.sendMessage(content, recipientPubkey);
}

// 2. BUSINESS LOGIC (Business Layer)
// MessagingBusinessService.ts
async sendMessage(content: string, recipient: string) {
  // Validate business rules
  if (!this.validateRecipient(recipient)) throw new Error();
  
  // Orchestrate core services
  const encrypted = await this.encryptionService.encrypt(content, recipient);
  const event = await this.eventService.createDirectMessage(encrypted);
  
  // Publish via protocol layer
  await this.nostrService.publishEvent(event);
  
  // Update cache
  await this.cacheService.cacheMessage(event);
  
  return event;
}

// 3. CORE SERVICES (Core Layer)
// EncryptionService.ts
async encrypt(plaintext: string, pubkey: string) {
  // NIP-04 encryption logic
  return await nip04.encrypt(this.privateKey, pubkey, plaintext);
}

// 4. PROTOCOL LAYER (Data Layer)
// GenericNostrService.ts
async publishEvent(event: NostrEvent) {
  // Send to all connected relays
  for (const relay of this.relays) {
    await relay.publish(event);
  }
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/psam21/ncoin.git
cd ncoin

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

---

## 🔑 Key Nostr Concepts

### NIPs (Nostr Implementation Possibilities)

- **NIP-01**: Basic protocol - events, signatures, relays
- **NIP-04**: Encrypted Direct Messages
- **NIP-05**: Mapping Nostr keys to DNS-based identifiers
- **NIP-07**: Browser extension signing
- **NIP-19**: bech32-encoded entities (npub, nsec, note)
- **NIP-96**: Blossom - decentralized file storage

### Relays

The application connects to multiple Nostr relays for redundancy:
- Default relays configured in `/src/config/relays.ts`
- WebSocket-based real-time communication
- Automatic reconnection and failover

### Key Management

- **Private keys**: Stored securely in browser (encrypted localStorage)
- **Public keys**: User identity (npub format)
- **Signing**: All events cryptographically signed
- **Backup**: Exportable key backup files

---

## 🧪 Testing Strategy

### Unit Tests
- Service layer methods (business logic in isolation)
- Utility functions (key management, validation)
- Core services (caching, encryption)

### Integration Tests
- Service composition (business → core → protocol)
- Nostr event flow
- Authentication workflows

### E2E Tests
- User journeys (signup, messaging, profile updates)
- Cross-feature workflows

---

## 🛡️ Security Considerations

- **Client-side encryption**: Messages encrypted before transmission
- **No password storage**: Nostr uses cryptographic keys
- **Relay privacy**: Users can choose their own relays
- **Censorship resistance**: Decentralized architecture
- **Key backup**: User-controlled key management

---

## 📝 Environment Variables

```bash
# Required
NEXT_PUBLIC_DEFAULT_RELAYS=wss://relay1.example.com,wss://relay2.example.com

# Optional
NEXT_PUBLIC_BLOSSOM_SERVER=https://blossom.example.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🔗 Resources

- [Nostr Protocol](https://github.com/nostr-protocol/nostr)
- [NIPs Repository](https://github.com/nostr-protocol/nips)
- [Next.js Documentation](https://nextjs.org/docs)
- [Nostr Development Kit](https://ndk.fyi)

---

**Built with ⚡ by nomads, for nomads**
