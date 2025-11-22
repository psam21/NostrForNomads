import React from 'react';
import { Users, Check, X, HelpCircle } from 'lucide-react';
import { logger } from '@/services/core/LoggingService';
import type { ParsedRSVP } from '@/types/meetup';

interface AttendeesListProps {
  rsvps: ParsedRSVP[];
  showStatusFilter?: boolean;
  maxDisplay?: number;
  variant?: 'compact' | 'detailed';
}

/**
 * Attendees List Component
 * Displays list of RSVPs with user info and status badges
 * 
 * SOA Layer: Presentation (UI only, no business logic)
 * 
 * Features:
 * - Status-based filtering and display
 * - User profile display with fallbacks
 * - Compact and detailed variants
 * - Avatar placeholder support
 * - Responsive design
 */
export const AttendeesList: React.FC<AttendeesListProps> = ({
  rsvps,
  showStatusFilter = true,
  maxDisplay,
  variant = 'detailed'
}) => {
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'accepted' | 'tentative' | 'declined'>('all');

  // Filter RSVPs by status
  const filteredRSVPs = React.useMemo(() => {
    if (activeFilter === 'all') {
      return rsvps;
    }
    return rsvps.filter(rsvp => rsvp.status === activeFilter);
  }, [rsvps, activeFilter]);

  // Get counts by status
  const counts = React.useMemo(() => {
    return {
      all: rsvps.length,
      accepted: rsvps.filter(r => r.status === 'accepted').length,
      tentative: rsvps.filter(r => r.status === 'tentative').length,
      declined: rsvps.filter(r => r.status === 'declined').length,
    };
  }, [rsvps]);

  // Limit display if maxDisplay is set
  const displayRSVPs = maxDisplay ? filteredRSVPs.slice(0, maxDisplay) : filteredRSVPs;
  const hasMore = maxDisplay && filteredRSVPs.length > maxDisplay;

  const handleFilterChange = (filter: 'all' | 'accepted' | 'tentative' | 'declined') => {
    logger.info('Attendees filter changed', {
      component: 'AttendeesList',
      method: 'handleFilterChange',
      filter,
      totalRSVPs: rsvps.length,
      filteredCount: filter === 'all' ? rsvps.length : counts[filter],
    });
    setActiveFilter(filter);
  };

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          icon: <Check className="w-4 h-4" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          label: 'Going'
        };
      case 'tentative':
        return {
          icon: <HelpCircle className="w-4 h-4" />,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-700',
          label: 'Maybe'
        };
      case 'declined':
        return {
          icon: <X className="w-4 h-4" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          label: 'Not Going'
        };
      default:
        return {
          icon: <Users className="w-4 h-4" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          label: 'Unknown'
        };
    }
  };

  // Get user display name with fallback
  const getUserDisplayName = (rsvp: ParsedRSVP): string => {
    if (rsvp.displayName) return rsvp.displayName;
    return `${rsvp.pubkey.slice(0, 8)}...${rsvp.pubkey.slice(-8)}`;
  };

  // Get user avatar initials
  const getUserInitials = (rsvp: ParsedRSVP): string => {
    if (rsvp.displayName) {
      const parts = rsvp.displayName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return rsvp.displayName.slice(0, 2).toUpperCase();
    }
    return rsvp.pubkey.slice(0, 2).toUpperCase();
  };

  if (rsvps.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No RSVPs yet</p>
        <p className="text-sm">Be the first to RSVP to this event!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      {showStatusFilter && (
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => handleFilterChange('accepted')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1 ${
              activeFilter === 'accepted'
                ? 'bg-green-100 text-green-700 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            Going ({counts.accepted})
          </button>
          <button
            onClick={() => handleFilterChange('tentative')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1 ${
              activeFilter === 'tentative'
                ? 'bg-yellow-100 text-yellow-700 border-b-2 border-yellow-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Maybe ({counts.tentative})
          </button>
          <button
            onClick={() => handleFilterChange('declined')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1 ${
              activeFilter === 'declined'
                ? 'bg-red-100 text-red-700 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            Not Going ({counts.declined})
          </button>
        </div>
      )}

      {/* Attendees List */}
      <div className="space-y-2">
        {displayRSVPs.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No attendees with this status</p>
          </div>
        ) : (
          <>
            {displayRSVPs.map((rsvp) => {
              const statusDisplay = getStatusDisplay(rsvp.status);
              const displayName = getUserDisplayName(rsvp);
              const initials = getUserInitials(rsvp);

              if (variant === 'compact') {
                return (
                  <div
                    key={`${rsvp.pubkey}-${rsvp.eventDTag}`}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {displayName}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
                      {statusDisplay.icon}
                    </div>
                  </div>
                );
              }

              // Detailed variant
              return (
                <div
                  key={`${rsvp.pubkey}-${rsvp.eventDTag}`}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {displayName}
                    </p>

                    {/* Npub if available */}
                    {rsvp.npub && (
                      <p className="text-xs text-gray-500 truncate">
                        {rsvp.npub}
                      </p>
                    )}

                    {/* Comment if available */}
                    {rsvp.comment && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {rsvp.comment}
                      </p>
                    )}

                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-2 ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
                      {statusDisplay.icon}
                      <span>{statusDisplay.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Show More Indicator */}
            {hasMore && (
              <div className="text-center py-3 text-sm text-gray-500">
                +{filteredRSVPs.length - maxDisplay!} more attendee
                {filteredRSVPs.length - maxDisplay! !== 1 ? 's' : ''}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
