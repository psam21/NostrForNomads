import { 
  updateWorkWithAttachments, 
  UpdateWorkResult
} from '@/services/business/WorkUpdateService';
import type { WorkData, WorkPublishingProgress } from '@/types/work';
import { useContentEditing, type SimpleUpdateFunction } from './useContentEditing';

/**
 * Hook for editing work opportunities
 * 
 * Uses generic useContentEditing hook to handle common editing patterns:
 * - Signer validation
 * - State management (isUpdating, updateError, updateProgress)
 * - Progress tracking
 * - Error handling
 * - Logging
 */
export function useWorkEditing() {
  // Wrap the service function to match SimpleUpdateFunction signature
  const updateFn: SimpleUpdateFunction<WorkData, UpdateWorkResult, WorkPublishingProgress> = async (
    contentId,
    updatedData,
    attachmentFiles,
    signer,
    onProgress,
    selectiveOps
  ) => {
    return await updateWorkWithAttachments(
      contentId,
      updatedData,
      attachmentFiles,
      signer,
      onProgress,
      selectiveOps
    );
  };

  const {
    isUpdating,
    updateError,
    updateProgress,
    updateContent,
    clearUpdateError,
  } = useContentEditing<WorkData, UpdateWorkResult, WorkPublishingProgress>(
    'useWorkEditing',
    updateFn,
    false // Work update doesn't require pubkey parameter
  );

  return {
    isUpdating,
    updateError,
    updateProgress,
    updateWorkData: updateContent,
    clearUpdateError,
  };
}
