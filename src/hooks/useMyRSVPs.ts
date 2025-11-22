'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/services/core/LoggingService';
import { fetchMyRSVPs, deleteRSVP, filterUpcomingMeetups } from '@/services/business/MeetService';
import type { ParsedRSVP, MeetupEvent } from '@/types/meetup';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNostrSigner } from './useNostrSigner';
import { AppError } from '@/errors/AppError';
import { ErrorCode, HttpStatus, ErrorCategory, ErrorSeverity } from '@/errors/ErrorTypes';

/**
 * Enriched RSVP with meetup details
 */
interface EnrichedRSVP {
  rsvp: ParsedRSVP;
  meetup: MeetupEvent | null;
}

/**
 * Hook for managing user's RSVP history
 * Fetches user's RSVPs enriched with meetup details
 * Provides filtered views and deletion capability
 */
export function useMyRSVPs() {
  const { user, isAuthenticated } = useAuthStore();
  const { signer } = useNostrSigner();
  const pubkey = user?.pubkey;

  const [rsvps, setRSVPs] = useState<EnrichedRSVP[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Load user's RSVPs with meetup details
   */
  const loadMyRSVPs = useCallback(async () => {
    if (!pubkey || !isAuthenticated) {
      logger.warn('Cannot load RSVPs: not authenticated', {
        service: 'useMyRSVPs',
        method: 'loadMyRSVPs',
        hasPubkey: !!pubkey,
        isAuthenticated,
      });
      return;
    }

    try {
      logger.info('Loading user RSVPs', {
        service: 'useMyRSVPs',
        method: 'loadMyRSVPs',
        pubkey: pubkey.substring(0, 8) + '...',
      });

      setIsLoading(true);
      setError(null);

      // Fetch RSVPs with enriched meetup details
      const userRSVPs = await fetchMyRSVPs(pubkey);
      
      // Sort by RSVP creation date (newest first)
      const sorted = userRSVPs.sort((a, b) => b.rsvp.timestamp - a.rsvp.timestamp);
      
      setRSVPs(sorted);

      logger.info('User RSVPs loaded', {
        service: 'useMyRSVPs',
        method: 'loadMyRSVPs',
        rsvpCount: sorted.length,
      });
    } catch (err) {
      const appError = err instanceof AppError 
        ? err 
        : new AppError(
            err instanceof Error ? err.message : 'Failed to load RSVPs',
            ErrorCode.NOSTR_ERROR,
            HttpStatus.INTERNAL_SERVER_ERROR,
            ErrorCategory.EXTERNAL_SERVICE,
            ErrorSeverity.MEDIUM
          );

      logger.error('Error loading user RSVPs', appError, {
        service: 'useMyRSVPs',
        method: 'loadMyRSVPs',
        pubkey: pubkey?.substring(0, 8) + '...',
      });
      
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, [pubkey, isAuthenticated]);

  /**
   * Cancel an RSVP (delete)
   * 
   * @param eventDTag - Meetup dTag
   * @param meetupName - Meetup name (for deletion reason)
   */
  const cancelRSVP = useCallback(async (
    eventDTag: string,
    meetupName: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!signer) {
      const error = 'No signer available. Please sign in first.';
      logger.error('Cancel RSVP failed: no signer', new Error(error), {
        service: 'useMyRSVPs',
        method: 'cancelRSVP',
      });
      return { success: false, error };
    }

    try {
      logger.info('Canceling RSVP', {
        service: 'useMyRSVPs',
        method: 'cancelRSVP',
        eventDTag,
        meetupName,
      });

      setIsDeleting(true);

      const result = await deleteRSVP(eventDTag, signer, meetupName);

      if (result.success) {
        logger.info('RSVP canceled successfully', {
          service: 'useMyRSVPs',
          method: 'cancelRSVP',
          eventDTag,
        });

        // Remove from local state
        setRSVPs((prev) => prev.filter((r) => r.rsvp.eventDTag !== eventDTag));
      } else {
        logger.error('RSVP cancellation failed', new Error(result.error || 'Unknown error'), {
          service: 'useMyRSVPs',
          method: 'cancelRSVP',
        });
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel RSVP';
      
      logger.error('Exception during RSVP cancellation', err instanceof Error ? err : new Error(errorMessage), {
        service: 'useMyRSVPs',
        method: 'cancelRSVP',
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsDeleting(false);
    }
  }, [signer]);

  /**
   * Get RSVPs filtered by accepted status
   */
  const acceptedRSVPs = useCallback(() => {
    return rsvps.filter((r) => r.rsvp.status === 'accepted');
  }, [rsvps]);

  /**
   * Get RSVPs filtered by tentative status
   */
  const tentativeRSVPs = useCallback(() => {
    return rsvps.filter((r) => r.rsvp.status === 'tentative');
  }, [rsvps]);

  /**
   * Get RSVPs filtered by declined status
   */
  const declinedRSVPs = useCallback(() => {
    return rsvps.filter((r) => r.rsvp.status === 'declined');
  }, [rsvps]);

  /**
   * Get upcoming meetups from accepted RSVPs
   */
  const upcomingMeetups = useCallback(() => {
    const accepted = acceptedRSVPs();
    const meetupsWithDetails = accepted
      .filter((r) => r.meetup) // Only include RSVPs with meetup details
      .map((r) => r.meetup!);
    
    return filterUpcomingMeetups(meetupsWithDetails);
  }, [acceptedRSVPs]);

  // Auto-load on mount when authenticated (PAGE REFRESH behavior)
  useEffect(() => {
    if (pubkey && isAuthenticated) {
      loadMyRSVPs();
    }
  }, [pubkey, isAuthenticated, loadMyRSVPs]);

  return {
    rsvps,
    isLoading,
    error,
    isDeleting,
    loadMyRSVPs, // Manual refresh
    cancelRSVP,
    acceptedRSVPs, // Filter helper
    tentativeRSVPs, // Filter helper
    declinedRSVPs, // Filter helper
    upcomingMeetups, // Filter helper
  };
}
