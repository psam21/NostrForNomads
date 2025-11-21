import { logger } from '@/services/core/LoggingService';
import type { WorkData, WorkPublishingProgress } from '@/types/work';
import { validateWorkData } from './WorkValidationService';
import { nostrEventService } from '../nostr/NostrEventService';
import type { NostrSigner } from '@/types/nostr';
import { uploadSequentialWithConsent } from '@/services/generic/GenericBlossomService';
import { fetchPublicWorkOpportunities as fetchPublicWorkFromRelay, type WorkEvent } from '@/services/generic/GenericWorkService';

export interface CreateWorkResult {
  success: boolean;
  eventId?: string;
  dTag?: string;
  publishedRelays?: string[];
  failedRelays?: string[];
  error?: string;
  [key: string]: unknown; // For generic wrapper compatibility
}

/**
 * Create a new work opportunity with file upload, event creation and publishing
 * Orchestrates: validation → upload → event creation → publishing
 * 
 * @param workData - Work opportunity data (attachments can be empty, will be populated from files)
 * @param attachmentFiles - File objects to upload (empty array if no files)
 * @param signer - Nostr signer for signing events and uploads
 * @param existingDTag - Optional dTag for updates (undefined for new opportunities)
 * @param onProgress - Optional callback for progress updates
 */
export async function createWork(
  workData: WorkData,
  attachmentFiles: File[],
  signer: NostrSigner,
  existingDTag?: string,
  onProgress?: (progress: WorkPublishingProgress) => void
): Promise<CreateWorkResult> {
  try {
    logger.info('Starting work opportunity creation', {
      service: 'WorkService',
      method: 'createWork',
      title: workData.title,
      isEdit: !!existingDTag,
      attachmentFilesCount: attachmentFiles.length,
    });

    // Step 1: Validate work data
    onProgress?.({
      step: 'validating',
      progress: 10,
      message: 'Validating work opportunity...',
      details: 'Checking required fields',
    });

    const validation = validateWorkData(workData);
    if (!validation.valid) {
      const errorMsg = Object.values(validation.errors).join(', ');
      logger.error('Work validation failed', new Error(errorMsg), {
        service: 'WorkService',
        method: 'createWork',
        errors: validation.errors,
      });
      return {
        success: false,
        error: errorMsg,
      };
    }

    // Step 2: Upload attachment files (if any)
    const uploadedAttachments: Array<{
      type: 'image' | 'video' | 'audio';
      url: string;
      hash: string;
      name: string;
      id: string;
      size: number;
      mimeType: string;
    }> = [];

    if (attachmentFiles.length > 0) {
      onProgress?.({
        step: 'uploading',
        progress: 30,
        message: 'Uploading media files...',
        details: `Uploading ${attachmentFiles.length} file(s)`,
      });

      logger.info('Uploading attachment files', {
        service: 'WorkService',
        method: 'createWork',
        fileCount: attachmentFiles.length,
      });

      const uploadResult = await uploadSequentialWithConsent(
        attachmentFiles,
        signer,
        (uploadProgress) => {
          // Map upload progress (0-1) to publishing progress (30-70)
          const progressPercent = 30 + (40 * uploadProgress.overallProgress);
          onProgress?.({
            step: 'uploading',
            progress: progressPercent,
            message: uploadProgress.nextAction,
            details: `File ${uploadProgress.currentFileIndex + 1} of ${uploadProgress.totalFiles}`,
            attachmentProgress: {
              current: uploadProgress.currentFileIndex + 1,
              total: uploadProgress.totalFiles,
              currentFile: uploadProgress.currentFile.name,
            },
          });
        }
      );

      // Check for cancellation or failure
      if (uploadResult.userCancelled) {
        return {
          success: false,
          error: 'User cancelled upload',
        };
      }

      if (uploadResult.successCount === 0) {
        return {
          success: false,
          error: 'All media uploads failed',
        };
      }

      // Map uploaded files to attachment format
      for (let i = 0; i < uploadResult.uploadedFiles.length; i++) {
        const uploadedFile = uploadResult.uploadedFiles[i];
        const originalFile = attachmentFiles[i];
        
        // Determine media type from MIME type
        const mimeType = originalFile.type;
        let type: 'image' | 'video' | 'audio' = 'image';
        if (mimeType.startsWith('video/')) type = 'video';
        else if (mimeType.startsWith('audio/')) type = 'audio';

        uploadedAttachments.push({
          type,
          url: uploadedFile.url,
          hash: uploadedFile.hash,
          name: originalFile.name,
          id: `${uploadedFile.hash}-${Date.now()}`,
          size: originalFile.size,
          mimeType,
        });
      }

      logger.info('Media uploaded successfully', {
        service: 'WorkService',
        method: 'createWork',
        uploadedCount: uploadResult.successCount,
        failedCount: uploadResult.failureCount,
      });
    }

    // Step 3: Use uploaded attachments only
    const allAttachments = uploadedAttachments.map(att => ({
      id: att.id,
      url: att.url,
      type: att.type,
      hash: att.hash,
      name: att.name,
      size: att.size,
      mimeType: att.mimeType,
    }));

    // Map to simplified format for event service
    const mappedAttachments = allAttachments
      .filter(att => att.url)
      .map(att => ({
        url: att.url!,
        type: att.type,
        hash: att.hash,
        name: att.name,
        size: att.size,
        mimeType: att.mimeType,
      }));

    // Step 4: Create Nostr event using work-specific method
    onProgress?.({
      step: 'publishing',
      progress: 70,
      message: 'Creating Nostr event...',
      details: 'Signing and creating event',
    });

    logger.info('Creating work event', {
      service: 'WorkService',
      method: 'createWork',
      title: workData.title,
      dTag: existingDTag,
    });

    const event = await nostrEventService.createWorkEvent(
      {
        title: workData.title,
        description: workData.description,
        category: workData.category,
        jobType: workData.jobType,
        duration: workData.duration,
        payRate: workData.payRate,
        currency: workData.currency,
        contact: workData.contact,
        language: workData.language || 'en',
        location: workData.location || '',
        region: workData.region,
        country: workData.country,
        tags: workData.tags,
        attachments: mappedAttachments,
      },
      signer,
      existingDTag
    );

    // Step 5: Publish to relays (optimistic - return on first success)
    onProgress?.({
      step: 'publishing',
      progress: 85,
      message: 'Publishing to relays...',
      details: 'Broadcasting event',
    });

    logger.info('Publishing event to relays with optimistic return', {
      service: 'WorkService',
      method: 'createWork',
      eventId: event.id,
      title: workData.title,
    });

    // Extract dTag before publishing
    const dTag = event.tags.find(tag => tag[0] === 'd')?.[1];
    if (!dTag) {
      throw new Error('Created event missing required d tag');
    }

    // Start publishing - this runs in parallel to all relays
    const publishPromise = nostrEventService.publishEvent(
      event,
      signer,
      (relay, status) => {
        logger.info('Relay publishing status', {
          service: 'WorkService',
          method: 'createWork',
          relay,
          status,
          eventId: event.id,
        });
      }
    );

    // Create a race condition: return as soon as we have first confirmation OR all complete
    const firstSuccessPromise = new Promise<CreateWorkResult>((resolve) => {
      let resolvedEarly = false;
      const publishedRelays: string[] = [];
      
      // Monitor progress and resolve early on first success
      const progressHandler = (relay: string, status: 'publishing' | 'success' | 'failed') => {
        if (status === 'success' && !resolvedEarly) {
          publishedRelays.push(relay);
          resolvedEarly = true;
          resolve({
            success: true,
            eventId: event.id,
            dTag,
            publishedRelays: [relay],
            failedRelays: [],
          });
        }
      };
      
      // Re-publish with progress monitoring
      nostrEventService.publishEvent(event, signer, progressHandler);
    });

    // Wait for either first success or full completion
    const publishResult = await Promise.race([
      firstSuccessPromise,
      publishPromise.then((result): CreateWorkResult => ({
        success: result.success,
        eventId: result.eventId,
        dTag,
        publishedRelays: result.publishedRelays,
        failedRelays: result.failedRelays,
      })),
    ]);

    // Background: Continue publishing to remaining relays
    publishPromise.then((finalResult) => {
      logger.info('Background relay publishing completed', {
        service: 'WorkService',
        method: 'createWork',
        eventId: event.id,
        finalPublishedCount: finalResult.publishedRelays.length,
        finalFailedCount: finalResult.failedRelays.length,
      });
    }).catch((err) => {
      logger.warn('Background relay publishing encountered errors', {
        service: 'WorkService',
        method: 'createWork',
        eventId: event.id,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    });

    if (!publishResult.success) {
      return {
        success: false,
        error: `Failed to publish to any relay: ${publishResult.error}`,
        eventId: event.id,
        dTag,
        publishedRelays: publishResult.publishedRelays,
        failedRelays: publishResult.failedRelays,
      };
    }

    // Step 6: Report completion
    onProgress?.({
      step: 'complete',
      progress: 100,
      message: 'Work opportunity published!',
      details: `Successfully published to ${publishResult.publishedRelays?.length || 1} relays`,
    });

    logger.info('Work opportunity created successfully', {
      service: 'WorkService',
      method: 'createWork',
      eventId: event.id,
      dTag,
      title: workData.title,
      publishedRelays: publishResult.publishedRelays?.length || 1,
    });

    return {
      success: true,
      eventId: event.id,
      dTag,
      publishedRelays: publishResult.publishedRelays,
      failedRelays: publishResult.failedRelays,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to create work opportunity', error instanceof Error ? error : new Error(errorMessage), {
      service: 'WorkService',
      method: 'createWork',
      title: workData.title,
      error: errorMessage,
    });
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Fetch public work opportunities from relay
 * 
 * @param limit - Maximum number of work opportunities to fetch
 * @param until - Optional timestamp for pagination
 * @returns Array of work events with transformed data
 */
export async function fetchPublicWorkOpportunities(
  limit = 8,
  until?: number
): Promise<WorkEvent[]> {
  try {
    logger.info('Fetching public work opportunities', {
      service: 'WorkService',
      method: 'fetchPublicWorkOpportunities',
      limit,
      until,
    });

    const workEvents = await fetchPublicWorkFromRelay(limit, until);

    logger.info('Work opportunities fetched successfully', {
      service: 'WorkService',
      method: 'fetchPublicWorkOpportunities',
      count: workEvents.length,
    });

    return workEvents;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch work opportunities', error instanceof Error ? error : new Error(errorMessage), {
      service: 'WorkService',
      method: 'fetchPublicWorkOpportunities',
      error: errorMessage,
    });
    return [];
  }
}

export const WorkService = {
  createWork,
  fetchPublicWorkOpportunities,
};
