import { logger } from '@/services/core/LoggingService';
import type { WorkData, WorkPublishingProgress } from '@/types/work';
import type { NostrSigner } from '@/types/nostr';
import type { GenericAttachment } from '@/types/attachments';
import { uploadSequentialWithConsent } from '@/services/generic/GenericBlossomService';
import { nostrEventService } from '../nostr/NostrEventService';
import { fetchWorkById } from './WorkService';

export interface UpdateWorkResult {
  success: boolean;
  eventId?: string;
  dTag?: string;
  publishedRelays?: string[];
  failedRelays?: string[];
  error?: string;
  [key: string]: unknown; // For generic wrapper compatibility
}

/**
 * Update an existing work opportunity with attachments
 * Follows reference pattern: fetch original → upload new → merge with selective ops → publish
 * 
 * @param workId - The d-tag ID of the work opportunity to update
 * @param updatedData - Partial work data with fields to update
 * @param attachmentFiles - New File objects to upload (NOT existing attachments)
 * @param signer - Nostr signer for signing events
 * @param onProgress - Optional callback for progress updates
 * @param selectiveOps - Optional: Explicitly specify which attachments to keep/remove
 */
export async function updateWorkWithAttachments(
  workId: string,
  updatedData: Partial<WorkData>,
  attachmentFiles: File[],
  signer: NostrSigner,
  onProgress?: (progress: WorkPublishingProgress) => void,
  selectiveOps?: { removedAttachments: string[]; keptAttachments: string[] }
): Promise<UpdateWorkResult> {
  try {
    onProgress?.({
      step: 'validating',
      progress: 5,
      message: 'Starting update...',
      details: 'Validating work opportunity',
    });

    logger.info('Starting work opportunity update with attachments', {
      service: 'WorkUpdateService',
      method: 'updateWorkWithAttachments',
      workId,
      newAttachmentCount: attachmentFiles.length,
      hasSelectiveOps: !!selectiveOps,
      selectiveOps: selectiveOps ? {
        removedCount: selectiveOps.removedAttachments.length,
        keptCount: selectiveOps.keptAttachments.length,
      } : null,
    });

    // Step 1: Fetch the original work opportunity
    const originalWork = await fetchWorkById(workId);
    if (!originalWork) {
      return {
        success: false,
        error: `Original work opportunity not found: ${workId}`,
      };
    }

    logger.info('Original work opportunity state before update', {
      service: 'WorkUpdateService',
      method: 'updateWorkWithAttachments',
      workId,
      originalState: {
        title: originalWork.title,
        description: originalWork.description,
        mediaCount: (originalWork.media.images.length + originalWork.media.videos.length + originalWork.media.audio.length),
      },
    });

    // Step 2: Upload new attachment files (if any)
    let newAttachments: GenericAttachment[] = [];

    if (attachmentFiles.length > 0) {
      onProgress?.({
        step: 'uploading',
        progress: 10,
        message: 'Starting media upload...',
        details: `Uploading ${attachmentFiles.length} file(s)`,
      });

      logger.info('Uploading new attachments', {
        service: 'WorkUpdateService',
        method: 'updateWorkWithAttachments',
        fileCount: attachmentFiles.length,
      });

      const uploadResult = await uploadSequentialWithConsent(
        attachmentFiles,
        signer,
        (progress) => {
          // Map upload progress to work publishing progress (10% to 70%)
          const progressPercent = 10 + (progress.overallProgress * 60);
          onProgress?.({
            step: 'uploading',
            progress: progressPercent,
            message: 'Uploading attachments...',
            details: `File ${progress.currentFileIndex + 1} of ${progress.totalFiles}`,
          });

          logger.info('Upload progress', {
            service: 'WorkUpdateService',
            method: 'updateWorkWithAttachments',
            ...progress,
          });
        }
      );

      if (!uploadResult.success && !uploadResult.partialSuccess) {
        return {
          success: false,
          error: `Failed to upload attachments: ${uploadResult.failedFiles.map(f => f.error).join(', ')}`,
        };
      }

      // Map uploaded files to attachment format with proper ID
      newAttachments = uploadResult.uploadedFiles.map((uploaded, index) => {
        const file = attachmentFiles.find(f => f.name === uploaded.fileId);
        const fileType = uploaded.fileType || '';
        
        let attachmentType: 'image' | 'video' | 'audio' = 'image';
        if (fileType.startsWith('video/')) attachmentType = 'video';
        else if (fileType.startsWith('audio/')) attachmentType = 'audio';

        return {
          id: uploaded.hash || uploaded.url || `upload-${index}`,
          url: uploaded.url,
          type: attachmentType,
          hash: uploaded.hash,
          name: file?.name || uploaded.fileId,
          size: uploaded.fileSize || 0,
          mimeType: uploaded.fileType || 'application/octet-stream',
        };
      });

      logger.info('New attachments uploaded', {
        service: 'WorkUpdateService',
        method: 'updateWorkWithAttachments',
        uploadedCount: newAttachments.length,
        failedCount: uploadResult.failedFiles.length,
      });
    }

    // Step 3: Merge attachments using selective operations
    let allAttachments: GenericAttachment[] = [];

    // Convert existing media to attachment format with proper ID
    const existingAttachments = [
      ...originalWork.media.images.map((m, index) => ({
        id: m.hash || m.url || `image-${index}`,
        url: m.url,
        type: 'image' as const,
        hash: m.hash,
        name: m.url.split('/').pop() || 'image',
        size: m.size || 0,
        mimeType: m.mimeType || 'image/jpeg',
      })),
      ...originalWork.media.videos.map((m, index) => ({
        id: m.hash || m.url || `video-${index}`,
        url: m.url,
        type: 'video' as const,
        hash: m.hash,
        name: m.url.split('/').pop() || 'video',
        size: m.size || 0,
        mimeType: m.mimeType || 'video/mp4',
      })),
      ...originalWork.media.audio.map((m, index) => ({
        id: m.hash || m.url || `audio-${index}`,
        url: m.url,
        type: 'audio' as const,
        hash: m.hash,
        name: m.url.split('/').pop() || 'audio',
        size: m.size || 0,
        mimeType: m.mimeType || 'audio/mpeg',
      })),
    ];

    if (selectiveOps) {
      // Selective mode: Keep only specified attachments + add new ones
      const keptUrlSet = new Set<string>();
      selectiveOps.keptAttachments.forEach(keptId => {
        const found = existingAttachments.find(att => att.id === keptId);
        if (found?.url) {
          keptUrlSet.add(found.url);
        }
      });
      
      // Filter by URL (stable identifier across re-fetches)
      const keptAttachments = existingAttachments.filter(att => 
        keptUrlSet.has(att.url)
      );
      allAttachments = [...keptAttachments, ...newAttachments];

      logger.info('Selective attachment merge', {
        service: 'WorkUpdateService',
        method: 'updateWorkWithAttachments',
        originalCount: existingAttachments.length,
        keptCount: keptAttachments.length,
        removedCount: selectiveOps.removedAttachments.length,
        newCount: newAttachments.length,
        finalCount: allAttachments.length,
      });
    } else {
      // Legacy mode: Keep all existing + add new ones
      allAttachments = newAttachments.length > 0
        ? [...existingAttachments, ...newAttachments]
        : existingAttachments;

      logger.info('Legacy attachment merge (keep all + new)', {
        service: 'WorkUpdateService',
        method: 'updateWorkWithAttachments',
        existingCount: existingAttachments.length,
        newCount: newAttachments.length,
        finalCount: allAttachments.length,
      });
    }

    // Step 4: Prepare merged data - ensure all non-optional fields have values
    const mergedData: WorkData = {
      title: updatedData.title !== undefined ? updatedData.title : originalWork.title,
      description: updatedData.description !== undefined ? updatedData.description : originalWork.description,
      category: updatedData.category !== undefined ? updatedData.category : originalWork.category,
      jobType: updatedData.jobType !== undefined ? updatedData.jobType : originalWork.jobType,
      duration: updatedData.duration !== undefined ? updatedData.duration : originalWork.duration,
      payRate: updatedData.payRate !== undefined ? updatedData.payRate : originalWork.payRate,
      currency: updatedData.currency !== undefined ? updatedData.currency : originalWork.currency,
      language: updatedData.language !== undefined ? updatedData.language : (originalWork.language ?? 'en'),
      location: updatedData.location !== undefined ? updatedData.location : (originalWork.location ?? ''),
      region: updatedData.region !== undefined ? updatedData.region : originalWork.region,
      country: updatedData.country !== undefined ? updatedData.country : (originalWork.country ?? 'Unknown'),
      contact: updatedData.contact !== undefined ? updatedData.contact : originalWork.contact,
      tags: updatedData.tags !== undefined ? updatedData.tags : originalWork.tags,
      attachments: allAttachments,
    };

    // Step 5: Check for changes (avoid unnecessary updates)
    const hasContentChanges = 
      (updatedData.title !== undefined && updatedData.title !== originalWork.title) ||
      (updatedData.description !== undefined && updatedData.description !== originalWork.description) ||
      (updatedData.category !== undefined && updatedData.category !== originalWork.category) ||
      (updatedData.jobType !== undefined && updatedData.jobType !== originalWork.jobType) ||
      (updatedData.duration !== undefined && updatedData.duration !== originalWork.duration) ||
      (updatedData.payRate !== undefined && updatedData.payRate !== originalWork.payRate) ||
      (updatedData.currency !== undefined && updatedData.currency !== originalWork.currency) ||
      (updatedData.language !== undefined && updatedData.language !== originalWork.language) ||
      (updatedData.location !== undefined && updatedData.location !== originalWork.location) ||
      (updatedData.region !== undefined && updatedData.region !== originalWork.region) ||
      (updatedData.country !== undefined && updatedData.country !== originalWork.country) ||
      (updatedData.contact !== undefined && updatedData.contact !== originalWork.contact) ||
      (updatedData.tags !== undefined && JSON.stringify(updatedData.tags) !== JSON.stringify(originalWork.tags));

    const hasAttachmentChanges = newAttachments.length > 0 || (selectiveOps && selectiveOps.removedAttachments.length > 0);

    if (!hasContentChanges && !hasAttachmentChanges) {
      logger.info('No changes detected, skipping update', {
        service: 'WorkUpdateService',
        method: 'updateWorkWithAttachments',
        workId,
        reason: 'No content or attachment changes detected',
      });

      return {
        success: true,
        dTag: originalWork.dTag,
        eventId: originalWork.id,
      };
    }

    logger.info('Changes detected, proceeding with update', {
      service: 'WorkUpdateService',
      method: 'updateWorkWithAttachments',
      workId,
      hasContentChanges,
      hasAttachmentChanges,
    });

    // Step 6: Create NIP-33 replacement event (same dTag)
    onProgress?.({
      step: 'publishing',
      progress: 75,
      message: 'Creating event...',
      details: 'Preparing NIP-33 replacement event',
    });

    logger.info('Creating replacement event', {
      service: 'WorkUpdateService',
      method: 'updateWorkWithAttachments',
      dTag: originalWork.dTag,
      title: mergedData.title,
      attachmentCount: allAttachments.length,
    });

    const event = await nostrEventService.createWorkEvent(
      mergedData as unknown as Parameters<typeof nostrEventService.createWorkEvent>[0],
      signer,
      originalWork.dTag // Same dTag for NIP-33 replacement
    );

    // Step 7: Publish to relays
    onProgress?.({
      step: 'publishing',
      progress: 85,
      message: 'Publishing to relays...',
      details: 'Broadcasting replacement event',
    });

    logger.info('Publishing replacement event to relays', {
      service: 'WorkUpdateService',
      method: 'updateWorkWithAttachments',
      eventId: event.id,
      dTag: originalWork.dTag,
    });

    const publishResult = await nostrEventService.publishEvent(
      event,
      signer
    );

    if (!publishResult.success) {
      logger.error('Failed to publish replacement event', new Error(publishResult.error), {
        service: 'WorkUpdateService',
        method: 'updateWorkWithAttachments',
        eventId: event.id,
      });
      return {
        success: false,
        error: `Failed to publish to any relay: ${publishResult.error}`,
        eventId: event.id,
        publishedRelays: publishResult.publishedRelays,
        failedRelays: publishResult.failedRelays,
      };
    }

    logger.info('Work opportunity updated successfully', {
      service: 'WorkUpdateService',
      method: 'updateWorkWithAttachments',
      eventId: event.id,
      dTag: originalWork.dTag,
      title: mergedData.title,
      publishedRelays: publishResult.publishedRelays.length,
      mediaCount: allAttachments.length,
    });

    onProgress?.({
      step: 'complete',
      progress: 100,
      message: 'Update complete!',
      details: `Published to ${publishResult.publishedRelays.length} relays`,
    });

    return {
      success: true,
      eventId: event.id,
      dTag: originalWork.dTag,
      publishedRelays: publishResult.publishedRelays,
      failedRelays: publishResult.failedRelays,
    };

  } catch (error) {
    logger.error('Failed to update work opportunity', error instanceof Error ? error : new Error('Unknown error'), {
      service: 'WorkUpdateService',
      method: 'updateWorkWithAttachments',
      workId,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error updating work opportunity',
    };
  }
}
