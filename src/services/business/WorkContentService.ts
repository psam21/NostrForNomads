import { logger } from '@/services/core/LoggingService';
import { BaseContentProvider } from './BaseContentProvider';
import { queryEvents } from '../generic/GenericRelayService';
import type { WorkCustomFields } from '@/types/work';
import type { ContentDetailResult, ContentMeta } from '@/types/content-detail';
import type { ContentMediaItem } from '@/types/content-media';

/**
 * Service for fetching work opportunity content details from Nostr relays
 * Extends BaseContentProvider to provide work-specific content fetching
 */
class WorkContentService extends BaseContentProvider<WorkCustomFields> {
  private static instance: WorkContentService;

  private constructor() {
    super();
  }

  public static getInstance(): WorkContentService {
    if (!WorkContentService.instance) {
      WorkContentService.instance = new WorkContentService();
    }
    return WorkContentService.instance;
  }

  protected getServiceName(): string {
    return 'WorkContentService';
  }

  public async getContentDetail(id: string): Promise<ContentDetailResult<WorkCustomFields>> {
    logger.info('Fetching work opportunity content detail', {
      service: 'WorkContentService',
      method: 'getContentDetail',
      workId: id,
    });

    try {
      // Query for work event by d-tag
      const filters = [
        {
          kinds: [30023],
          '#d': [id],
          '#t': ['nostr-for-nomads-work'],
        },
      ];

      logger.info('Querying relays for work opportunity', {
        service: 'WorkContentService',
        method: 'getContentDetail',
        filters,
      });

      const queryResult = await queryEvents(filters);

      if (!queryResult.success || !queryResult.events || queryResult.events.length === 0) {
        logger.warn('Work opportunity not found', {
          service: 'WorkContentService',
          method: 'getContentDetail',
          workId: id,
        });
        return {
          success: false,
          error: 'Work opportunity not found',
        };
      }

      // Get the most recent event (highest created_at)
      const event = queryResult.events.sort((a, b) => b.created_at - a.created_at)[0];
      
      logger.info('Work opportunity event found', {
        service: 'WorkContentService',
        method: 'getContentDetail',
        eventId: event.id,
        workId: id,
      });

      // Parse event tags
      const tagsMap = new Map(event.tags.map((tag: string[]) => [tag[0], tag[1]]));
      
      const title = tagsMap.get('title') || 'Untitled Work Opportunity';
      const summary = tagsMap.get('summary') || '';
      const publishedAt = parseInt(tagsMap.get('published_at') || String(event.created_at));
      const location = tagsMap.get('location') || '';
      const imageUrl = tagsMap.get('image') || '';

      // Parse work-specific fields
      const jobType = tagsMap.get('job-type') || '';
      const duration = tagsMap.get('duration') || '';
      const payRateStr = tagsMap.get('pay-rate') || '0';
      const payRate = parseFloat(payRateStr);
      const currency = tagsMap.get('currency') || '';
      const contact = tagsMap.get('contact');
      const category = tagsMap.get('category') || '';
      const region = tagsMap.get('region') || '';
      const country = tagsMap.get('country') || '';
      const language = tagsMap.get('language') || 'en';

      // Extract media attachments from imeta tags
      const media: ContentMediaItem[] = [];
      let mediaIndex = 0;

      for (const tag of event.tags as string[][]) {
        if (tag[0] === 'imeta') {
          const metaMap = new Map<string, string>();
          for (let i = 1; i < tag.length; i++) {
            const part = tag[i];
            const spaceIndex = part.indexOf(' ');
            if (spaceIndex > 0) {
              const key = part.substring(0, spaceIndex);
              const value = part.substring(spaceIndex + 1);
              metaMap.set(key, value);
            }
          }

          const url = metaMap.get('url');
          const mimeType = metaMap.get('m');
          if (url) {
            const mediaType: 'image' | 'video' | 'audio' = 
              mimeType?.startsWith('video/') ? 'video' :
              mimeType?.startsWith('audio/') ? 'audio' : 
              'image';

            const dimStr = metaMap.get('dim');
            let dimensions: { width: number; height: number } | undefined;
            if (dimStr) {
              const [width, height] = dimStr.split('x').map(n => parseInt(n));
              if (width && height) {
                dimensions = { width, height };
              }
            }

            media.push({
              id: `media-${mediaIndex++}`,
              source: {
                url,
                mimeType,
                hash: metaMap.get('x'),
                size: metaMap.get('size') ? parseInt(metaMap.get('size')!) : undefined,
                dimensions,
              },
              description: metaMap.get('alt') || '',
              type: mediaType,
            });
          }
        }
      }

      // Get author info
      const npub = this.tryGetNpub(event.pubkey);
      const authorDisplayName = await this.tryGetAuthorDisplayName(event.pubkey);

      // Build metadata display
      const customFields: WorkCustomFields = {
        jobType: jobType || undefined,
        duration: duration || undefined,
        payRate: payRate || undefined,
        currency: currency || undefined,
        contact: contact || undefined,
        category: category || undefined,
        region: region || undefined,
        country: country || undefined,
        language: language || undefined,
        location: location || undefined,
      };

      const meta: ContentMeta[] = [];
      if (customFields.jobType) {
        meta.push({ label: 'Job Type', value: customFields.jobType });
      }
      if (customFields.duration) {
        meta.push({ label: 'Duration', value: customFields.duration });
      }
      if (customFields.payRate && customFields.currency) {
        meta.push({ label: 'Pay Rate', value: `${customFields.payRate} ${customFields.currency}` });
      }
      if (customFields.category) {
        meta.push({ label: 'Category', value: customFields.category });
      }
      if (customFields.region) {
        meta.push({ label: 'Region', value: customFields.region });
      }
      if (customFields.country) {
        meta.push({ label: 'Country', value: customFields.country });
      }
      if (customFields.location) {
        meta.push({ label: 'Location', value: customFields.location });
      }
      if (customFields.contact) {
        meta.push({ label: 'Contact', value: customFields.contact });
      }
      if (customFields.language) {
        meta.push({ label: 'Language', value: customFields.language });
      }

      // Extract general tags (not system tags)
      const systemTags = new Set([
        'title', 'summary', 'published_at', 'image', 'location',
        'job-type', 'duration', 'pay-rate', 'currency', 'contact',
        'category', 'region', 'country', 'language', 'd', 'imeta', 't'
      ]);
      const generalTags = event.tags
        .filter((tag: string[]) => !systemTags.has(tag[0]))
        .map((tag: string[]) => tag[1])
        .filter(Boolean);

      // Parse description - handle both markdown string and JSON object in event.content
      let fullDescription = summary;
      if (event.content) {
        try {
          // Try parsing as JSON first (some events have structured content)
          const parsed = JSON.parse(event.content);
          // If it's an object with content or description field, use that
          if (parsed && typeof parsed === 'object') {
            fullDescription = parsed.content || parsed.description || summary;
          } else if (typeof parsed === 'string') {
            fullDescription = parsed;
          }
        } catch {
          // If not JSON, treat as plain markdown text
          fullDescription = event.content;
        }
      }

      // Clean up any trailing hashtag sequences
      fullDescription = fullDescription.replace(/\n*#[A-Z0-9#]+$/i, '').trim();

      return {
        success: true,
        content: {
          id,
          dTag: id,
          title,
          description: fullDescription,
          summary: summary || fullDescription.slice(0, 200) + '...',
          publishedAt,
          author: {
            pubkey: event.pubkey,
            npub,
            displayName: authorDisplayName,
          },
          tags: generalTags,
          media,
          contentType: 'work',
          customFields,
          meta,
          actions: [
            {
              id: 'contact-poster',
              label: 'Contact Poster',
              type: 'primary',
              metadata: {
                posterPubkey: event.pubkey,
                workId: id,
                workTitle: title,
                workImageUrl: imageUrl || media[0]?.source.url,
                contact: customFields.contact,
              },
            },
          ],
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching work opportunity';
      logger.error('Error fetching work opportunity content', error instanceof Error ? error : new Error(errorMessage), {
        service: 'WorkContentService',
        method: 'getContentDetail',
        workId: id,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const workContentService = WorkContentService.getInstance();
