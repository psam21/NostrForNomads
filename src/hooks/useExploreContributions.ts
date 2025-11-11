'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { logger } from '@/services/core/LoggingService';
import { fetchPublicContributions, type ContributionExploreItem } from '@/services/business/ContributionService';
import { AppError } from '@/errors/AppError';
import { ErrorCode, HttpStatus, ErrorCategory, ErrorSeverity } from '@/errors/ErrorTypes';

export interface ContributionFilters {
  searchTerm: string;
  category: string;
  region: string;
  sortBy: 'newest' | 'oldest' | 'title-asc' | 'title-desc';
}

export function useExploreContributions(filters?: ContributionFilters) {
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

      // Call business service instead of generic service
      const items = await fetchPublicContributions(8);
      
      setContributionItems(items);
      setHasMore(items.length === 8);

      logger.info('Initial contribution items loaded', {
        service: 'useExploreContributions',
        method: 'loadInitial',
        itemCount: items.length,
        hasMore: items.length === 8,
      });
    } catch (err) {
      const appError = err instanceof AppError 
        ? err 
        : new AppError(
            err instanceof Error ? err.message : 'Failed to load contributions',
            ErrorCode.NOSTR_ERROR,
            HttpStatus.INTERNAL_SERVER_ERROR,
            ErrorCategory.EXTERNAL_SERVICE,
            ErrorSeverity.MEDIUM
          );
      
      logger.error('Error loading initial contribution items', appError, {
        service: 'useExploreContributions',
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
      
      // Call business service instead of generic service
      const newItems = await fetchPublicContributions(6, lastTimestamp);
      
      setContributionItems(prev => {
        const existingDTags = new Set(prev.map(item => item.dTag));
        const uniqueNewItems = newItems.filter(item => !existingDTags.has(item.dTag));
        return [...prev, ...uniqueNewItems];
      });
      
      setHasMore(newItems.length === 6);

      logger.info('More contribution items loaded', {
        service: 'useExploreContributions',
        method: 'loadMore',
        newItemCount: newItems.length,
        totalCount: contributionItems.length + newItems.length,
        hasMore: newItems.length === 6,
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

  // Extract unique categories and regions from loaded data
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    contributionItems.forEach(item => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [contributionItems]);

  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    contributionItems.forEach(item => {
      if (item.region) set.add(item.region);
    });
    return Array.from(set).sort();
  }, [contributionItems]);

  // Apply client-side filtering and sorting
  const filteredAndSortedItems = useMemo(() => {
    if (!filters) return contributionItems;

    let filtered = [...contributionItems];

    // Apply search filter
    if (filters.searchTerm.trim()) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term) ||
        item.region.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Apply region filter
    if (filters.region !== 'all') {
      filtered = filtered.filter((item) => item.region === filters.region);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => a.publishedAt - b.publishedAt);
        break;
      case 'title-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'title-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => b.publishedAt - a.publishedAt);
        break;
    }

    return filtered;
  }, [contributionItems, filters]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    if (!filters) return 0;
    let count = 0;
    if (filters.searchTerm.trim()) count++;
    if (filters.category !== 'all') count++;
    if (filters.region !== 'all') count++;
    return count;
  }, [filters]);

  return {
    contributionItems: filteredAndSortedItems,
    allItems: contributionItems,
    isLoading,
    error,
    refetch,
    loadMore,
    isLoadingMore,
    hasMore,
    availableCategories,
    availableRegions,
    activeFilterCount,
  };
}
