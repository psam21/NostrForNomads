import type { ProductAttachment } from './attachments';
import type { NostrEvent } from './nostr';

/**
 * Product form data interface
 * Maps to ProductForm fields
 */
export interface ProductData {
  // Basic Information
  title: string;
  description: string;
  price: number;
  currency: 'BTC' | 'sats' | 'USD';
  
  // Product Details
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  contact: string; // Nostr npub or contact method
  
  // Media & Attachments
  attachments: ProductAttachment[];
  
  // Tags & Keywords
  tags: string[];
}

/**
 * Product Nostr event (Kind 30023)
 */
export interface ProductNostrEvent extends NostrEvent {
  kind: 30023;
  tags: [
    ['d', string], // Unique identifier (dTag)
    ['t', 'nostr-for-nomads-shop'], // System tag (hidden)
    ['title', string],
    ['price', string],
    ['currency', string],
    ['category', string],
    ['condition', string],
    ['location', string],
    ['contact', string],
    ...Array<
      | ['t', string] // User tags
      | ['image', string] // Media URLs
      | ['video', string]
      | ['audio', string]
      | ['imeta', ...string[]] // NIP-94 metadata
    >
  ];
  content: string; // JSON stringified description
}

/**
 * Product event from relay (parsed)
 */
export interface ProductEvent {
  id: string;
  dTag: string;
  pubkey: string;
  title: string;
  summary: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  location: string;
  contact: string;
  tags: string[];
  media: {
    images: MediaAttachment[];
    audio: MediaAttachment[];
    videos: MediaAttachment[];
  };
  createdAt: number;
  publishedAt: number;
}

/**
 * Product card data for display
 */
export interface ProductCardData {
  id: string;
  dTag: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  location: string;
  imageUrl?: string; // First media URL
  tags: string[];
  pubkey: string; // Author for ownership check
  createdAt: number;
}

/**
 * Type alias: ShopProduct is same as ProductCardData
 * Used in stores for consistency with temp-cb-reference pattern
 */
export type ShopProduct = ProductCardData;

/**
 * Type alias: ProductExploreItem is same as ProductCardData
 * Used in public browse/explore views
 */
export type ProductExploreItem = ProductCardData;

/**
 * Product publishing result
 */
export interface ProductPublishingResult {
  success: boolean;
  eventId?: string;
  dTag?: string;
  error?: string;
  publishedRelays?: string[];
  failedRelays?: string[];
  [key: string]: unknown;
}

/**
 * Product update result
 */
export interface UpdateProductResult {
  success: boolean;
  eventId?: string;
  product?: ProductEvent;
  publishedRelays?: string[];
  failedRelays?: string[];
  error?: string;
  [key: string]: unknown;
}

/**
 * Product publishing state
 */
export interface ProductPublishingState {
  isPublishing: boolean;
  uploadProgress: number | ProductPublishingProgress;
  currentStep: 'idle' | 'validating' | 'uploading' | 'creating' | 'publishing' | 'complete' | 'error';
  error: string | null;
  result: ProductPublishingResult | null;
}

/**
 * Product publishing progress
 */
export interface ProductPublishingProgress {
  step: 'validating' | 'uploading' | 'publishing' | 'complete';
  progress: number; // 0-100
  message: string;
  details?: string;
  attachmentProgress?: {
    current: number;
    total: number;
    currentFile: string;
  };
  [key: string]: unknown;
}

/**
 * Product validation result
 */
export interface ProductValidationResult {
  valid: boolean;
  errors: {
    title?: string;
    description?: string;
    price?: string;
    currency?: string;
    category?: string;
    condition?: string;
    location?: string;
    contact?: string;
    attachments?: string;
    tags?: string;
  };
}

/**
 * Media attachment with metadata
 * Extracted from imeta tags (NIP-94) or simple media tags
 */
export interface MediaAttachment {
  url: string;
  mimeType?: string;
  hash?: string;
  size?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================

/**
 * Tag keys used in Product Nostr events (Kind 30023)
 * Standardized tag identifiers for consistent event structure
 */
export const PRODUCT_TAG_KEYS = {
  D_TAG: 'd',           // Unique identifier (NIP-33)
  SYSTEM_TAG: 't',      // System tag marker
  TITLE: 'title',       // Product title
  PRICE: 'price',       // Price value
  CURRENCY: 'currency', // Currency code
  CATEGORY: 'category', // Product category
  CONDITION: 'condition', // Product condition
  LOCATION: 'location', // Location/region
  CONTACT: 'contact',   // Contact method
  USER_TAG: 't',        // User-defined tag
  IMAGE: 'image',       // Image URL
  VIDEO: 'video',       // Video URL
  AUDIO: 'audio',       // Audio URL
  IMETA: 'imeta',       // NIP-94 metadata
} as const;

/**
 * System tag value for Shop products
 * Used to identify and filter Shop events across the Nostr network
 */
export const PRODUCT_SYSTEM_TAG = 'nostr-for-nomads-shop';

/**
 * Type guard to check if an event is a valid ProductEvent
 * Verifies presence of required fields and correct structure
 */
export function isProductEvent(event: unknown): event is ProductEvent {
  if (!event || typeof event !== 'object') return false;
  
  const e = event as Record<string, unknown>;
  
  return (
    typeof e.id === 'string' &&
    typeof e.dTag === 'string' &&
    typeof e.pubkey === 'string' &&
    typeof e.title === 'string' &&
    typeof e.description === 'string' &&
    typeof e.price === 'number' &&
    typeof e.currency === 'string' &&
    typeof e.category === 'string' &&
    typeof e.condition === 'string' &&
    typeof e.createdAt === 'number' &&
    typeof e.publishedAt === 'number'
  );
}

/**
 * Type guard to check if data is valid ProductData
 * Validates required fields for product creation
 */
export function isProductData(data: unknown): data is ProductData {
  if (!data || typeof data !== 'object') return false;
  
  const d = data as Record<string, unknown>;
  
  return (
    typeof d.title === 'string' &&
    typeof d.description === 'string' &&
    typeof d.price === 'number' &&
    typeof d.currency === 'string' &&
    typeof d.category === 'string' &&
    typeof d.condition === 'string' &&
    typeof d.location === 'string' &&
    typeof d.contact === 'string' &&
    Array.isArray(d.tags) &&
    Array.isArray(d.attachments)
  );
}

/**
 * Helper to extract dTag from ProductEvent
 */
export function getProductDTag(event: ProductEvent): string {
  return event.dTag;
}

/**
 * Helper to format product price with currency
 */
export function formatProductPrice(price: number, currency: string): string {
  if (currency === 'BTC') {
    return `₿${price.toFixed(8)}`;
  } else if (currency === 'sats') {
    return `${price.toLocaleString()} sats`;
  } else {
    // USD and other fiat
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
}

/**
 * Helper to get product media count
 */
export function getProductMediaCount(product: ProductEvent): number {
  return (
    product.media.images.length +
    product.media.videos.length +
    product.media.audio.length
  );
}

/**
 * Helper to check if product has media
 */
export function hasProductMedia(product: ProductEvent): boolean {
  return getProductMediaCount(product) > 0;
}

