import { logger } from '../core/LoggingService';
import { queryEvents } from './GenericRelayService';
import type { NostrEvent } from '@/types/nostr';
import { extractMedia, type MediaAttachment } from './GenericContributionService';

export interface WorkEvent {
  id: string;
  dTag: string;
  pubkey: string;
  title: string;
  summary: string;
  description: string; // Full content from event.content field
  category: string;
  jobType: string;
  duration: string;
  payRate: number;
  currency: string;
  contact?: string;
  language: string; // Language tag from event
  location: string;
  region: string;
  country?: string;
  tags: string[];
  media: {
    images: MediaAttachment[];
    audio: MediaAttachment[];
    videos: MediaAttachment[];
  };
  createdAt: number;
  publishedAt: number;
}

function parseWorkEvent(event: NostrEvent): WorkEvent | null {
  try {
    const tags = event.tags as string[][];
    
    // Extract required fields
    const dTag = tags.find(t => t[0] === 'd')?.[1];
    const title = tags.find(t => t[0] === 'title')?.[1];
    const summary = tags.find(t => t[0] === 'summary')?.[1];
    
    // Skip events missing required fields
    if (!dTag || !title) {
      logger.warn('Work event missing required fields', {
        service: 'GenericWorkService',
        method: 'parseWorkEvent',
        eventId: event.id,
        hasDTag: !!dTag,
        hasTitle: !!title,
      });
      return null;
    }
    
    // Extract work-specific required fields
    const category = tags.find(t => t[0] === 'category')?.[1] || 'other';
    const jobType = tags.find(t => t[0] === 'job-type')?.[1] || 'remote';
    const duration = tags.find(t => t[0] === 'duration')?.[1] || 'ongoing';
    const payRateStr = tags.find(t => t[0] === 'pay-rate')?.[1];
    const payRate = payRateStr ? parseFloat(payRateStr) : 0;
    const currency = tags.find(t => t[0] === 'currency')?.[1] || 'usd';
    
    // Extract optional fields
    const contact = tags.find(t => t[0] === 'contact')?.[1];
    const language = tags.find(t => t[0] === 'language')?.[1] || 'en';
    const location = tags.find(t => t[0] === 'location')?.[1] || '';
    const region = tags.find(t => t[0] === 'region')?.[1] || '';
    const country = tags.find(t => t[0] === 'country')?.[1];
    
    // Extract custom tags (all tags with 't' key except system tags)
    const customTags = tags
      .filter(t => t[0] === 't' && !t[1].startsWith('nostr-for-nomads-'))
      .map(t => t[1]);
    
    // Extract media using shared function
    const media = extractMedia(tags);
    
    // Parse description from event.content (NIP-23 long-form content)
    let description = '';
    try {
      const nip23Content = JSON.parse(event.content);
      description = nip23Content.content || event.content || summary || title;
    } catch {
      // Fallback to raw content if not valid JSON
      description = event.content || summary || title;
    }
    
    return {
      id: event.id,
      dTag,
      pubkey: event.pubkey,
      title,
      summary: summary || title, // Fallback to title if no summary
      description,
      category,
      jobType,
      duration,
      payRate,
      currency,
      contact,
      language,
      location,
      region,
      country,
      tags: customTags,
      media,
      createdAt: event.created_at,
      publishedAt: event.created_at,
    };
  } catch (error) {
    logger.error('Error parsing work event', error instanceof Error ? error : new Error('Unknown error'), {
      service: 'GenericWorkService',
      method: 'parseWorkEvent',
      eventId: event.id,
    });
    return null;
  }
}

export async function fetchPublicWorkOpportunities(
  limit = 8,
  until?: number
): Promise<WorkEvent[]> {
  try {
    logger.info('Fetching public work opportunities', {
      service: 'GenericWorkService',
      method: 'fetchPublicWorkOpportunities',
      limit,
      until,
      hasPagination: !!until,
    });

    // Build relay filter
    const filter: Record<string, unknown> = {
      kinds: [30023],
      '#t': ['nostr-for-nomads-work'], // Must match tag used in event creation
      limit,
    };
    
    // Add pagination filter if provided
    if (until) {
      filter.until = until;
    }

    // Query relays
    const queryResult = await queryEvents([filter]);

    if (!queryResult.success || !queryResult.events || queryResult.events.length === 0) {
      logger.info('No work opportunities found', {
        service: 'GenericWorkService',
        method: 'fetchPublicWorkOpportunities',
        success: queryResult.success,
        eventCount: 0,
      });
      return [];
    }

    logger.info('Found work events from relays', {
      service: 'GenericWorkService',
      method: 'fetchPublicWorkOpportunities',
      eventCount: queryResult.events.length,
      relayCount: queryResult.relayCount,
    });

    // NIP-33 parameterized replaceable events - deduplicate by dTag, keeping newest
    // Some relays may return multiple versions temporarily, so we dedupe client-side
    const eventsByDTag = new Map<string, NostrEvent>();
    
    for (const event of queryResult.events) {
      const dTag = event.tags.find(t => t[0] === 'd')?.[1];
      if (!dTag) continue; // Skip events without dTag
      
      // Keep the event with the latest created_at timestamp for each dTag
      const existing = eventsByDTag.get(dTag);
      if (!existing || event.created_at > existing.created_at) {
        eventsByDTag.set(dTag, event);
      }
    }

    logger.info('Deduplicated work opportunities by dTag', {
      service: 'GenericWorkService',
      method: 'fetchPublicWorkOpportunities',
      originalCount: queryResult.events.length,
      deduplicatedCount: eventsByDTag.size,
    });

    // Parse deduplicated events
    const workEvents: WorkEvent[] = [];

    for (const event of eventsByDTag.values()) {
      const parsed = parseWorkEvent(event);
      if (parsed) {
        workEvents.push(parsed);
      }
    }

    // Sort by created_at DESC (newest first)
    workEvents.sort((a, b) => b.createdAt - a.createdAt);

    logger.info('Work opportunities parsed successfully', {
      service: 'GenericWorkService',
      method: 'fetchPublicWorkOpportunities',
      parsedCount: workEvents.length,
      deduplicatedCount: queryResult.events.length - workEvents.length,
    });

    return workEvents;
  } catch (error) {
    logger.error('Error fetching public work opportunities', error instanceof Error ? error : new Error('Unknown error'), {
      service: 'GenericWorkService',
      method: 'fetchPublicWorkOpportunities',
      limit,
      until,
    });
    return [];
  }
}

export async function fetchWorkByAuthor(
  authorPubkey: string,
  limit = 20
): Promise<WorkEvent[]> {
  try {
    logger.info('Fetching work opportunities by author', {
      service: 'GenericWorkService',
      method: 'fetchWorkByAuthor',
      authorPubkey,
      limit,
    });

    // Build relay filter
    const filter: Record<string, unknown> = {
      kinds: [30023],
      '#t': ['nostr-for-nomads-work'],
      authors: [authorPubkey],
      limit,
    };

    // Query relays
    const queryResult = await queryEvents([filter]);

    if (!queryResult.success || !queryResult.events || queryResult.events.length === 0) {
      logger.info('No work opportunities found for author', {
        service: 'GenericWorkService',
        method: 'fetchWorkByAuthor',
        authorPubkey,
        eventCount: 0,
      });
      return [];
    }

    logger.info('Found work events by author', {
      service: 'GenericWorkService',
      method: 'fetchWorkByAuthor',
      authorPubkey,
      eventCount: queryResult.events.length,
    });

    // Deduplicate by dTag
    const eventsByDTag = new Map<string, NostrEvent>();
    
    for (const event of queryResult.events) {
      const dTag = event.tags.find(t => t[0] === 'd')?.[1];
      if (!dTag) continue;
      
      const existing = eventsByDTag.get(dTag);
      if (!existing || event.created_at > existing.created_at) {
        eventsByDTag.set(dTag, event);
      }
    }

    // Parse deduplicated events
    const workEvents: WorkEvent[] = [];

    for (const event of eventsByDTag.values()) {
      const parsed = parseWorkEvent(event);
      if (parsed) {
        workEvents.push(parsed);
      }
    }

    // Sort by created_at DESC (newest first)
    workEvents.sort((a, b) => b.createdAt - a.createdAt);

    logger.info('Work opportunities by author parsed successfully', {
      service: 'GenericWorkService',
      method: 'fetchWorkByAuthor',
      authorPubkey,
      parsedCount: workEvents.length,
    });

    return workEvents;
  } catch (error) {
    logger.error('Error fetching work by author', error instanceof Error ? error : new Error('Unknown error'), {
      service: 'GenericWorkService',
      method: 'fetchWorkByAuthor',
      authorPubkey,
      limit,
    });
    return [];
  }
}

export async function fetchWorkById(
  dTag: string,
  authorPubkey?: string
): Promise<WorkEvent | null> {
  try {
    logger.info('Fetching work opportunity by ID', {
      service: 'GenericWorkService',
      method: 'fetchWorkById',
      dTag,
      authorPubkey,
    });

    // Build relay filter
    const filter: Record<string, unknown> = {
      kinds: [30023],
      '#t': ['nostr-for-nomads-work'],
      '#d': [dTag],
      limit: 10, // Get multiple versions to ensure we get the latest
    };

    // Add author filter if provided (more efficient)
    if (authorPubkey) {
      filter.authors = [authorPubkey];
    }

    // Query relays
    const queryResult = await queryEvents([filter]);

    if (!queryResult.success || !queryResult.events || queryResult.events.length === 0) {
      logger.info('Work opportunity not found', {
        service: 'GenericWorkService',
        method: 'fetchWorkById',
        dTag,
        authorPubkey,
      });
      return null;
    }

    logger.info('Found work event(s) by ID', {
      service: 'GenericWorkService',
      method: 'fetchWorkById',
      dTag,
      eventCount: queryResult.events.length,
    });

    // Get the latest version (highest created_at)
    const latestEvent = queryResult.events.reduce((latest, current) => 
      current.created_at > latest.created_at ? current : latest
    );

    const parsed = parseWorkEvent(latestEvent);

    if (parsed) {
      logger.info('Work opportunity parsed successfully', {
        service: 'GenericWorkService',
        method: 'fetchWorkById',
        dTag,
        workId: parsed.id,
      });
    }

    return parsed;
  } catch (error) {
    logger.error('Error fetching work by ID', error instanceof Error ? error : new Error('Unknown error'), {
      service: 'GenericWorkService',
      method: 'fetchWorkById',
      dTag,
      authorPubkey,
    });
    return null;
  }
}

export async function fetchWorkByCategory(
  category: string,
  limit = 8,
  until?: number
): Promise<WorkEvent[]> {
  try {
    logger.info('Fetching work opportunities by category', {
      service: 'GenericWorkService',
      method: 'fetchWorkByCategory',
      category,
      limit,
      until,
    });

    // Build relay filter
    const filter: Record<string, unknown> = {
      kinds: [30023],
      '#t': ['nostr-for-nomads-work'],
      '#category': [category],
      limit,
    };

    if (until) {
      filter.until = until;
    }

    // Query relays
    const queryResult = await queryEvents([filter]);

    if (!queryResult.success || !queryResult.events || queryResult.events.length === 0) {
      logger.info('No work opportunities found for category', {
        service: 'GenericWorkService',
        method: 'fetchWorkByCategory',
        category,
        eventCount: 0,
      });
      return [];
    }

    logger.info('Found work events by category', {
      service: 'GenericWorkService',
      method: 'fetchWorkByCategory',
      category,
      eventCount: queryResult.events.length,
    });

    // Deduplicate by dTag
    const eventsByDTag = new Map<string, NostrEvent>();
    
    for (const event of queryResult.events) {
      const dTag = event.tags.find(t => t[0] === 'd')?.[1];
      if (!dTag) continue;
      
      const existing = eventsByDTag.get(dTag);
      if (!existing || event.created_at > existing.created_at) {
        eventsByDTag.set(dTag, event);
      }
    }

    // Parse deduplicated events
    const workEvents: WorkEvent[] = [];

    for (const event of eventsByDTag.values()) {
      const parsed = parseWorkEvent(event);
      if (parsed) {
        workEvents.push(parsed);
      }
    }

    // Sort by created_at DESC (newest first)
    workEvents.sort((a, b) => b.createdAt - a.createdAt);

    logger.info('Work opportunities by category parsed successfully', {
      service: 'GenericWorkService',
      method: 'fetchWorkByCategory',
      category,
      parsedCount: workEvents.length,
    });

    return workEvents;
  } catch (error) {
    logger.error('Error fetching work by category', error instanceof Error ? error : new Error('Unknown error'), {
      service: 'GenericWorkService',
      method: 'fetchWorkByCategory',
      category,
      limit,
      until,
    });
    return [];
  }
}

export const GenericWorkService = {
  fetchPublicWorkOpportunities,
  fetchWorkByAuthor,
  fetchWorkById,
  fetchWorkByCategory,
};
