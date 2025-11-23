'use client';

import { updateMeetup } from '@/services/business/MeetService';
import type { MeetupData, MeetupPublishingResult, MeetupPublishingProgress } from '@/types/meetup';
import { useContentEditing, type SimpleUpdateFunction } from './useContentEditing';

/**
 * Hook for editing existing meetups
 * 
 * Uses generic useContentEditing hook to handle common editing patterns:
 * - Signer validation
 * - State management (isUpdating, updateError, updateProgress)
 * - Progress tracking
 * - Error handling
 * - Logging
 * 
 * Refactored from 175-line custom implementation to ~50 lines using generic wrapper.
 */
export function useMeetupEditing() {
  // Wrap the service function to match SimpleUpdateFunction signature
  const updateFn: SimpleUpdateFunction<MeetupData, MeetupPublishingResult, MeetupPublishingProgress> = async (
    contentId,
    updatedData,
    attachmentFiles,
    signer,
    onProgress,
    selectiveOps
  ) => {
    // updateMeetup expects: (data, dTag, files, signer, onProgress)
    // contentId is the dTag for meetups
    // Cast updatedData as full MeetupData since updateMeetup requires all fields
    return await updateMeetup(
      updatedData as MeetupData,
      contentId, // dTag
      attachmentFiles,
      signer,
      onProgress
    );
  };

  const {
    isUpdating,
    updateError,
    updateProgress,
    updateContent,
    clearUpdateError,
  } = useContentEditing<MeetupData, MeetupPublishingResult, MeetupPublishingProgress>(
    'useMeetupEditing',
    updateFn,
    false // Meetup update doesn't require pubkey parameter
  );

  return {
    isUpdating,
    updateError,
    updateProgress,
    updateMeetupContent: updateContent,
    clearUpdateError,
  };
}
