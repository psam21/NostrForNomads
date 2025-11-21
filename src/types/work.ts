import type { GenericAttachment } from './attachments';
import type { NostrEvent } from './nostr';

/**
 * Work Opportunity Types
 * Focused on freelance/gig job postings
 */

/**
 * Work form data interface
 * Maps to the WorkForm fields
 */
export interface WorkData {
  // Section 1: Basic Information
  title: string;
  category: string; // 'Development', 'Design', 'Writing', 'Marketing', 'Support', 'Other'
  jobType: string; // 'remote', 'on-site', 'hybrid'

  // Section 2: Details
  description: string;
  duration: string; // '1 week', '2 weeks', '1 month', '2 months', '3+ months', 'ongoing'
  language?: string;
  location?: string; // City/place (for on-site/hybrid)
  region: string;
  country: string;

  // Section 3: Compensation
  payRate: number;
  currency: string; // 'BTC', 'sats', 'USD', 'per hour', 'per day', 'per project'

  // Section 4: Media & Attachments
  attachments: GenericAttachment[];

  // Section 5: Tags & Keywords
  tags: string[];

  // Section 6: Contact (optional - defaults to Nostr DMs)
  contact?: string;
}

/**
 * Work Nostr event (Kind 30023)
 * Extended from base NostrEvent with work-specific tags
 */
export interface WorkNostrEvent extends NostrEvent {
  kind: 30023;
  tags: [
    ['d', string], // Unique identifier
    ['t', 'nostr-for-nomads-work'], // System tag (hidden)
    ['title', string],
    ['category', string],
    ['job-type', string], // Maps to jobType
    ['duration', string],
    ['region', string],
    ['country', string],
    ['pay-rate', string], // Maps to payRate (as string)
    ['currency', string],
    ...Array<
      | ['language', string]
      | ['location', string] // City/place
      | ['contact', string] // Optional contact info
      | ['t', string] // User tags
      | ['image', string] // Media URLs
      | ['video', string]
      | ['audio', string]
    >
  ];
  content: string; // JSON stringified description
}

/**
 * Work data for Nostr event creation
 * Simplified interface for the publishing hook
 */
export interface WorkEventData {
  title: string;
  category: string;
  jobType: string;
  duration: string;
  region: string;
  country: string;
  description: string;
  payRate: number;
  currency: string;
  language?: string;
  location?: string;
  contact?: string;
  tags: string[];
  attachments: GenericAttachment[];
}

/**
 * Work publishing result
 */
export interface WorkPublishingResult {
  success: boolean;
  eventId?: string;
  dTag?: string;
  error?: string;
  publishedRelays?: string[];
  failedRelays?: string[];
  [key: string]: unknown; // For generic wrapper compatibility
}

/**
 * Work publishing state
 */
export interface WorkPublishingState {
  isPublishing: boolean;
  uploadProgress: number | WorkPublishingProgress;
  currentStep: 'idle' | 'validating' | 'uploading' | 'creating' | 'publishing' | 'complete' | 'error';
  error: string | null;
  result: WorkPublishingResult | null;
}

/**
 * Work publishing progress
 */
export interface WorkPublishingProgress {
  step: 'idle' | 'validating' | 'uploading' | 'publishing' | 'complete' | 'error';
  progress: number;
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
 * Work attachment (extends GenericAttachment)
 */
export interface WorkAttachment extends GenericAttachment {
  type: 'image' | 'video' | 'audio';
  workId?: string;
  displayOrder: number;
  category?: 'image' | 'video' | 'audio';
}

/**
 * Work validation result
 */
export interface WorkValidationResult {
  valid: boolean;
  errors: {
    title?: string;
    category?: string;
    jobType?: string;
    description?: string;
    duration?: string;
    payRate?: string;
    currency?: string;
    region?: string;
    country?: string;
    attachments?: string;
    tags?: string;
  };
}

/**
 * Work for display (from Nostr event)
 */
export interface Work {
  id: string;
  dTag: string;
  title: string;
  category: string;
  jobType: string;
  duration: string;
  region: string;
  country: string;
  description: string;
  payRate: number;
  currency: string;
  language?: string;
  location?: string;
  contact?: string;
  tags: string[];
  media: Array<{ type: 'image' | 'video' | 'audio'; url: string }>;
  author: {
    pubkey: string;
    npub?: string;
    displayName?: string;
  };
  createdAt: number;
  updatedAt?: number;
  relays?: string[];
}

/**
 * Work card data for my-work dashboard display
 * Lightweight interface for grid/list view
 */
export interface WorkCardData {
  id: string;
  dTag: string;
  title: string;
  description: string;
  category: string;
  jobType: string;
  duration: string;
  payRate: number;
  currency: string;
  location?: string;
  region: string;
  country?: string;
  imageUrl?: string;
  tags: string[];
  pubkey: string;
  createdAt: number;
}

/**
 * Work event (parsed from relay)
 * Used by business services
 */
export interface WorkEvent {
  id: string;
  dTag: string;
  pubkey: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  jobType: string;
  duration: string;
  payRate: number;
  currency: string;
  language?: string;
  location?: string;
  region: string;
  country?: string;
  contact?: string;
  tags: string[];
  media: {
    images: Array<{ url: string; hash?: string; mimeType?: string }>;
    videos: Array<{ url: string; hash?: string; mimeType?: string }>;
    audio: Array<{ url: string; hash?: string; mimeType?: string }>;
  };
  createdAt: number;
  publishedAt: number;
}

/**
 * Tag mapping helpers
 */
export const WORK_TAG_KEYS = {
  D_TAG: 'd',
  SYSTEM_TAG: 't', // For 'nostr-for-nomads-work'
  TITLE: 'title',
  CATEGORY: 'category',
  JOB_TYPE: 'job-type',
  DURATION: 'duration',
  REGION: 'region',
  COUNTRY: 'country',
  PAY_RATE: 'pay-rate',
  CURRENCY: 'currency',
  LANGUAGE: 'language',
  LOCATION: 'location',
  CONTACT: 'contact',
  USER_TAG: 't',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
} as const;

/**
 * System tag constant
 */
export const WORK_SYSTEM_TAG = 'nostr-for-nomads-work';

/**
 * Helper to extract work data from Nostr event
 */
export const parseWorkEvent = (event: NostrEvent): Work | null => {
  try {
    const tags = event.tags;
    const getTag = (key: string): string | undefined => {
      const tag = tags.find(t => t[0] === key);
      return tag ? tag[1] : undefined;
    };

    const getAllTags = (key: string): string[] => {
      return tags.filter(t => t[0] === key).map(t => t[1]);
    };

    const dTag = getTag('d');
    const title = getTag('title');
    const category = getTag('category');
    const jobType = getTag('job-type');
    const duration = getTag('duration');
    const region = getTag('region');
    const country = getTag('country');
    const payRateStr = getTag('pay-rate');
    const currency = getTag('currency');

    if (!dTag || !title || !category || !jobType || !duration || !region || !country || !payRateStr || !currency) {
      return null;
    }

    const payRate = parseFloat(payRateStr);
    if (isNaN(payRate)) {
      return null;
    }

    // Parse user tags (exclude system tag)
    const userTags = getAllTags('t').filter(tag => tag !== WORK_SYSTEM_TAG);

    // Parse media
    const images = getAllTags('image').map(url => ({ type: 'image' as const, url }));
    const videos = getAllTags('video').map(url => ({ type: 'video' as const, url }));
    const audios = getAllTags('audio').map(url => ({ type: 'audio' as const, url }));
    const media = [...images, ...videos, ...audios];

    // Parse description from content
    let description = '';
    try {
      const content = JSON.parse(event.content);
      description = content.description || '';
    } catch {
      description = event.content;
    }

    return {
      id: event.id || dTag,
      dTag,
      title,
      category,
      jobType,
      duration,
      region,
      country,
      payRate,
      currency,
      description,
      language: getTag('language'),
      location: getTag('location'),
      contact: getTag('contact'),
      tags: userTags,
      media,
      author: {
        pubkey: event.pubkey,
      },
      createdAt: event.created_at,
      relays: [], // Will be populated by business service
    };
  } catch (error) {
    console.error('Failed to parse work event:', error);
    return null;
  }
};

/**
 * Type guard for work event
 */
export const isWorkEvent = (event: NostrEvent): event is WorkNostrEvent => {
  return (
    event.kind === 30023 &&
    event.tags.some(t => t[0] === 't' && t[1] === WORK_SYSTEM_TAG)
  );
};

/**
 * Custom fields for content detail display
 */
export interface WorkCustomFields extends Record<string, unknown> {
  category?: string;
  jobType?: string;
  duration?: string;
  payRate?: number;
  currency?: string;
  region?: string;
  country?: string;
  language?: string;
  location?: string;
  contact?: string;
}
