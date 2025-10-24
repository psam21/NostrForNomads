'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Activity, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserEventData {
  npub: string;
  eventId: string;
  eventKind: number;
  createdTimestamp: number;
  processedTimestamp: number;
  processingDuration: number;
  totalRelaysAttempted: number;
  successfulRelays: string[];
  failedRelays: string[];
  failedRelayReasons?: Record<string, string>;
  verifiedRelays?: string[];
  silentFailureRelays?: string[];
  unverifiedRelays?: string[];
  verificationTimestamp?: number;
  averageResponseTime: number;
  tagsCount: number;
  retryAttempts: number;
}

interface PaginatedEventResponse {
  events: UserEventData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function UserEventLogPage() {
  const [events, setEvents] = useState<UserEventData[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchEvents = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/get-all-events?page=${page}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data: PaginatedEventResponse = await response.json();
      setEvents(data.events);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Failed to fetch events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchEvents(pagination.page);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, pagination.page]);

  const getEventKindLabel = (kind: number): string => {
    const kinds: Record<number, string> = {
      0: 'Metadata',
      1: 'Note',
      3: 'Contacts',
      4: 'DM',
      5: 'Event Deletion',
      7: 'Reaction',
      30023: 'Long-form',
      30078: 'App Data',
    };
    return kinds[kind] || `Kind ${kind}`;
  };

  const getSuccessRate = (event: UserEventData): number => {
    if (event.totalRelaysAttempted === 0) return 0;
    return Math.round((event.successfulRelays.length / event.totalRelaysAttempted) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Global Event Activity</h1>
                <p className="text-gray-600 mt-1">Real-time Nostr event publishing analytics from all users</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                Auto-refresh (30s)
              </label>

              <button
                onClick={() => fetchEvents(pagination.page)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          {events.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Activity className="h-4 w-4" />
                  <span>Total Events</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Avg Success Rate</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(events.reduce((acc, e) => acc + getSuccessRate(e), 0) / events.length)}%
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Clock className="h-4 w-4" />
                  <span>Avg Processing</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(events.reduce((acc, e) => acc + e.processingDuration, 0) / events.length)}ms
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Zap className="h-4 w-4" />
                  <span>Avg Response</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(events.reduce((acc, e) => acc + e.averageResponseTime, 0) / events.length)}ms
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              <p className="font-medium">Error loading events</p>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && events.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading events...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && events.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-600">
                No Nostr events have been published yet. Events will appear here once users start publishing content.
              </p>
            </div>
          </div>
        )}

        {/* Events Table */}
        {events.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relays
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.eventId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {getEventKindLabel(event.eventKind)}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {event.eventId.substring(0, 8)}...{event.eventId.substring(event.eventId.length - 4)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-mono">
                          {event.npub.substring(0, 12)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(event.processedTimestamp), { addSuffix: true })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600 font-medium">
                            {event.successfulRelays.length}
                          </span>
                          <span className="text-gray-400">/</span>
                          <span className="text-sm text-gray-600">
                            {event.totalRelaysAttempted}
                          </span>
                          {event.verifiedRelays && event.verifiedRelays.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {event.verifiedRelays.length} verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>{event.processingDuration}ms</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Zap className="h-3 w-3" />
                            <span>{event.averageResponseTime}ms avg</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            getSuccessRate(event) === 100
                              ? 'bg-green-100 text-green-800'
                              : getSuccessRate(event) > 50
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {getSuccessRate(event) === 100 ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            <span>{getSuccessRate(event)}%</span>
                          </div>
                          {event.retryAttempts > 0 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {event.retryAttempts} retries
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} events
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchEvents(pagination.page - 1)}
                    disabled={pagination.page === 1 || isLoading}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchEvents(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || isLoading}
                    className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
