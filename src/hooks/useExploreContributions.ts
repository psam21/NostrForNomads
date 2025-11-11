'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/services/core/LoggingService';
import { fetchPublicHeritage, type HeritageEvent } from '@/services/generic/GenericHeritageService';
import { AppError } from '@/errors/AppError';
import { ErrorCode, HttpStatus, ErrorCategory, ErrorSeverity } from '@/errors/ErrorTypes';

export interface ContributionExploreItem {
  id: string;
  dTag: string;
  name: string;
  location: string;
  region: string;
  image: string;
  contributors: number;
  mediaCount: number;
  tags: string[];
  description: string;
  category: string;
  publishedAt: number;
  relativeTime: string;
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  if (diff < minute) return 'just now';
  if (diff < hour) return `${Math.floor(diff / minute)} minutes ago`;
  if (diff < day) return `${Math.floor(diff / hour)} hours ago`;
  if (diff < week) return `${Math.floor(diff / day)} days ago`;
  if (diff < month) return `${Math.floor(diff / week)} weeks ago`;
  if (diff < year) return `${Math.floor(diff / month)} months ago`;
  return `${Math.floor(diff / year)} years ago`;
}

function mapToExploreItem(event: HeritageEvent): ContributionExploreItem {
  const totalMedia = 
    event.media.images.length +
    event.media.audio.length +
    event.media.videos.length;
  
  const image = event.media.images[0] || 
                event.media.videos[0] || 
                'https://images.unsplash.com/photo-1606114701010-e2b90b5ab7d8?w=400&h=300&fit=crop';
  
  return {
    id: event.id,
    dTag: event.dTag,
    name: event.title,
    location: event.region || event.location || 'Unknown Location',
    region: event.region || 'Unknown Region',
    image,
    contributors: 1,
    mediaCount: totalMedia,
    tags: event.tags,
    description: event.summary,
    category: event.category,
    publishedAt: event.publishedAt,
    relativeTime: getRelativeTime(event.publishedAt),
  };
}

export function useExploreContributions() {
  const [contributionItems, setContributionItems] = useState<ContributionExploreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadInitial = useCallback(async () => {
    try {
      logger.info('Loading initial contribution items', {
        service: 'useExploreContributions',
        method: 'loadInitial',
        limit: 8,
      });

      setIsLoading(true);
      setError(null);

      const events = await fetchPublicHeritage(8);
      const items = events.map(mapToExploreItem);
      
      setContributionItems(items);
      setHasMore(events.length === 8);

      logger.info('Initial contribution items loaded', {
        service: 'useExploreContributions',
        method: 'loadInitial',
        itemCount: items.length,
        hasMore: events.length === 8,
      });
    } catch (err) {
      const appError = err instanceof AppError 
        ? err 
        : new AppError(
            err instanceof Error ? err.message : 'Failed to load heritage',
            ErrorCode.NOSTR_ERROR,
            HttpStatus.INTERNAL_SERVER_ERROR,
            ErrorCategory.EXTERNAL_SERVICE,
            ErrorSeverity.MEDIUM
          );
      
      logger.error('Error loading initial heritage items', appError, {
        service: 'useExploreHeritage',
        method: 'loadInitial',
      });
      
      setError(appError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || contributionItems.length === 0) {
      return;
    }

    try {
      logger.info('Loading more contribution items', {
        service: 'useExploreContributions',
        method: 'loadMore',
        currentCount: contributionItems.length,
      });

      setIsLoadingMore(true);

      const lastTimestamp = contributionItems[contributionItems.length - 1].publishedAt;
      const events = await fetchPublicHeritage(6, lastTimestamp);
      const newItems = events.map(mapToExploreItem);
      
      setContributionItems(prev => {
        const existingDTags = new Set(prev.map(item => item.dTag));
        const uniqueNewItems = newItems.filter(item => !existingDTags.has(item.dTag));
        return [...prev, ...uniqueNewItems];
      });
      
      setHasMore(events.length === 6);

      logger.info('More contribution items loaded', {
        service: 'useExploreContributions',
        method: 'loadMore',
        newItemCount: newItems.length,
        totalCount: contributionItems.length + newItems.length,
        hasMore: events.length === 6,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more contributions';
      
      logger.error('Error loading more contribution items', err instanceof Error ? err : new Error(errorMessage), {
        service: 'useExploreContributions',
        method: 'loadMore',
      });
      
      logger.warn('Load more failed, but keeping existing items', {
        service: 'useExploreContributions',
        method: 'loadMore',
        error: errorMessage,
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [contributionItems, isLoadingMore, hasMore]);

  const refetch = useCallback(() => {
    logger.info('Refetching contribution items', {
      service: 'useExploreContributions',
      method: 'refetch',
    });
    
    setContributionItems([]);
    setHasMore(true);
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    contributionItems,
    isLoading,
    error,
    refetch,
    loadMore,
    isLoadingMore,
    hasMore,
  };
}
