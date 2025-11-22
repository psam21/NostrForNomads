import type { NostrEvent } from '@/types/nostr';
import { MEETUP_CONFIG } from '@/config/meetup';

/**
 * MeetupEventService
 * Handles parsing of Nostr events for meetups
 * Layer: Event Service (stateless, pure functions)
 * 
 * Note: Event CREATION is handled by GenericEventService
 * This service only handles PARSING events from relays
 */
export class MeetupEventService {
  /**
   * Parse a meetup event from relay
   */
  static parseMeetupEvent(event: NostrEvent) {
    if (event.kind !== MEETUP_CONFIG.kinds.MEETUP) {
      throw new Error(`Invalid event kind: ${event.kind}`);
    }

    const tags = event.tags;
    const getTag = (name: string): string | undefined => {
      const tag = tags.find((t) => t[0] === name);
      return tag ? tag[1] : undefined;
    };

    const getAllTags = (name: string): string[] => {
      return tags.filter((t) => t[0] === name).map((t) => t[1]);
    };

    const dTag = getTag('d');
    if (!dTag) {
      throw new Error('Missing dTag in meetup event');
    }

    const name = getTag('name');
    if (!name) {
      throw new Error('Missing name in meetup event');
    }

    const startTimeStr = getTag('start');
    if (!startTimeStr) {
      throw new Error('Missing start time in meetup event');
    }

    const startTime = parseInt(startTimeStr, 10);
    if (isNaN(startTime)) {
      throw new Error('Invalid start time');
    }

    const location = getTag('location');
    if (!location) {
      throw new Error('Missing location in meetup event');
    }

    // Optional fields
    const endTimeStr = getTag('end');
    const endTime = endTimeStr ? parseInt(endTimeStr, 10) : undefined;

    const timezone = getTag('timezone');
    const geohash = getTag('g');
    const imageUrl = getTag('image');
    const virtualLink = getTag('virtual');
    const meetupType = getTag('meetup-type') || 'other';

    // Get host and co-hosts
    const pTags = tags.filter((t) => t[0] === 'p');
    const hostTag = pTags.find((t) => t[3] === 'host');
    const hostPubkey = hostTag ? hostTag[1] : event.pubkey;
    
    const coHostTags = pTags.filter((t) => t[3] === 'co-host');
    const coHosts = coHostTags.length > 0 ? coHostTags.map((t) => t[1]) : undefined;

    // Get user tags (exclude system tag)
    const userTags = getAllTags('t').filter(
      (t) => t !== MEETUP_CONFIG.systemTag
    );

    const isVirtual = location.toLowerCase() === 'virtual' || !!virtualLink;

    return {
      id: event.id || '',
      dTag,
      pubkey: event.pubkey,
      name,
      description: event.content,
      startTime,
      endTime,
      timezone,
      location,
      geohash,
      isVirtual,
      virtualLink,
      imageUrl,
      meetupType,
      tags: userTags,
      hostPubkey,
      coHosts,
      createdAt: event.created_at,
      publishedAt: event.created_at,
    };
  }

  /**
   * Parse an RSVP event from relay
   */
  static parseRSVPEvent(event: NostrEvent) {
    if (event.kind !== MEETUP_CONFIG.kinds.RSVP) {
      throw new Error(`Invalid event kind: ${event.kind}`);
    }

    const tags = event.tags;
    const getTag = (name: string): string | undefined => {
      const tag = tags.find((t) => t[0] === name);
      return tag ? tag[1] : undefined;
    };

    const dTag = getTag('d');
    if (!dTag) {
      throw new Error('Missing dTag in RSVP event');
    }

    const aTag = getTag('a');
    if (!aTag) {
      throw new Error('Missing aTag in RSVP event');
    }

    const status = getTag('status') as 'accepted' | 'declined' | 'tentative' | undefined;
    if (!status) {
      throw new Error('Missing status in RSVP event');
    }

    const eventPubkey = getTag('p');
    if (!eventPubkey) {
      throw new Error('Missing event creator pubkey in RSVP event');
    }

    // Extract eventDTag from aTag (format: 31923:pubkey:dTag)
    const aTagParts = aTag.split(':');
    if (aTagParts.length !== 3 || aTagParts[0] !== '31923') {
      throw new Error('Invalid aTag format');
    }
    const eventDTag = aTagParts[2];

    return {
      pubkey: event.pubkey,
      eventDTag,
      eventPubkey,
      status,
      comment: event.content || undefined,
      timestamp: event.created_at,
    };
  }

  /**
   * Validate meetup event structure
   */
  static validateMeetupEvent(event: NostrEvent): boolean {
    if (event.kind !== MEETUP_CONFIG.kinds.MEETUP) {
      return false;
    }

    const tags = event.tags;
    const hasTag = (name: string) => tags.some((t) => t[0] === name);

    // Required tags
    const requiredTags = ['d', 'name', 'start', 'location'];
    const hasAllRequired = requiredTags.every((tag) => hasTag(tag));

    if (!hasAllRequired) {
      return false;
    }

    // Must have system tag
    const hasSystemTag = tags.some(
      (t) => t[0] === 't' && t[1] === MEETUP_CONFIG.systemTag
    );

    return hasSystemTag;
  }

  /**
   * Validate RSVP event structure
   */
  static validateRSVPEvent(event: NostrEvent): boolean {
    if (event.kind !== MEETUP_CONFIG.kinds.RSVP) {
      return false;
    }

    const tags = event.tags;
    const hasTag = (name: string) => tags.some((t) => t[0] === name);

    // Required tags
    const requiredTags = ['d', 'a', 'status', 'p'];
    return requiredTags.every((tag) => hasTag(tag));
  }
}
