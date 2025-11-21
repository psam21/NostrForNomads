import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, Briefcase, DollarSign, Calendar, MessageCircle, ImageIcon } from 'lucide-react';
import { logger } from '@/services/core/LoggingService';
import { getRelativeTime } from '@/utils/dateUtils';

/**
 * Normalized work data for unified card
 * Bridges WorkExploreItem and WorkCardData
 */
export interface UnifiedWorkData {
  id: string;
  dTag: string;
  title: string;
  description: string;
  jobType: string;
  category: string;
  duration: string;
  payRate: number;
  currency: string;
  location: string;
  region: string;
  country?: string;
  imageUrl?: string;
  tags: string[];
  pubkey: string;
  createdAt: number;
  // Explore-specific fields (optional)
  mediaCount?: number;
  relativeTime?: string;
}

interface UnifiedWorkCardProps {
  work: UnifiedWorkData;
  variant: 'explore' | 'my-work';
  featured?: boolean;
  
  // Optional handlers for my-work variant
  onEdit?: (work: UnifiedWorkData) => void;
  onDelete?: (work: UnifiedWorkData) => void;
}

/**
 * Unified Work Card Component
 * Displays work opportunities in both /work and /my-work pages
 * 
 * SOA Layer: Presentation (UI only, no business logic)
 * 
 * Variants:
 * - explore: Shows contact button, job details, media count
 * - my-work: Shows edit, delete, view buttons
 * 
 * Features:
 * - Responsive design (adapts to screen size)
 * - Featured variant for highlighted opportunities
 * - Conditional action buttons based on variant
 * - Image fallback handling
 * - Hover effects and transitions
 * - Work-specific badges (jobType, duration, payRate+currency)
 */
export const UnifiedWorkCard: React.FC<UnifiedWorkCardProps> = ({ 
  work, 
  variant,
  featured = false,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();

  // Compute relative time if not provided
  const displayTime = work.relativeTime || getRelativeTime(work.createdAt);

  // Get job type color
  const getJobTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('remote')) return 'bg-blue-100 text-blue-700';
    if (lowerType.includes('on-site')) return 'bg-green-100 text-green-700';
    if (lowerType.includes('hybrid')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Get job type icon
  const getJobTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('remote')) return '🌍';
    if (lowerType.includes('on-site')) return '🏢';
    if (lowerType.includes('hybrid')) return '🔄';
    return '💼';
  };

  // Format pay rate display
  const formatPayRate = (rate: number, currency: string) => {
    const lowerCurrency = currency.toLowerCase();
    if (lowerCurrency === 'btc') return `${rate} BTC`;
    if (lowerCurrency === 'sats') return `${rate} sats`;
    if (lowerCurrency === 'usd') return `$${rate}`;
    if (lowerCurrency === 'per-hour') return `${rate}/hr`;
    if (lowerCurrency === 'per-day') return `${rate}/day`;
    if (lowerCurrency === 'per-project') return `${rate}/project`;
    return `${rate} ${currency}`;
  };

  // Handlers
  const handleContactPoster = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    logger.info('Contact poster clicked', {
      component: 'UnifiedWorkCard',
      method: 'handleContactPoster',
      variant,
      workId: work.id,
      title: work.title,
    });

    const params = new URLSearchParams({
      recipient: work.pubkey,
      context: `work:${work.id}`,
      contextTitle: work.title,
      ...(work.imageUrl && { contextImage: work.imageUrl }),
    });

    router.push(`/messages?${params.toString()}`);
  };

  const handleEdit = () => {
    logger.info('Edit work clicked', {
      component: 'UnifiedWorkCard',
      method: 'handleEdit',
      variant,
      workId: work.id,
      title: work.title,
    });
    onEdit?.(work);
  };

  const handleDelete = () => {
    logger.info('Delete work clicked', {
      component: 'UnifiedWorkCard',
      method: 'handleDelete',
      variant,
      workId: work.id,
      title: work.title,
    });
    onDelete?.(work);
  };

  const handleView = () => {
    logger.info('View work clicked', {
      component: 'UnifiedWorkCard',
      method: 'handleView',
      variant,
      workId: work.id,
      dTag: work.dTag,
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    logger.warn('Work image failed to load', {
      component: 'UnifiedWorkCard',
      method: 'handleImageError',
      variant,
      workId: work.id,
      imageUrl: work.imageUrl,
    });
    
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="w-full h-full flex items-center justify-center bg-blue-100">
          <svg class="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      `;
    }
  };

  // Featured card variant (explore only)
  if (featured && variant === 'explore') {
    return (
      <Link href={`/work/${work.dTag}`}>
        <div className="culture-card group p-0 overflow-hidden cursor-pointer">
          {/* Featured Work Image */}
          <div className="relative aspect-video">
            {work.imageUrl ? (
              <Image
                src={work.imageUrl}
                alt={`Work opportunity: ${work.title}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100">
                <Briefcase className="w-16 h-16 text-blue-400" />
              </div>
            )}
            
            <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Featured
            </div>
            
            {/* Job Type Badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeColor(work.jobType)}`}>
                {getJobTypeIcon(work.jobType)} {work.jobType}
              </span>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/50 rounded-lg p-4 text-white">
                <h3 className="text-xl font-serif font-bold mb-2">
                  {work.title}
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <p className="opacity-90 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {work.location} · {work.region}
                  </p>
                  <p className="opacity-90 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {formatPayRate(work.payRate, work.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 mb-4 line-clamp-3">{work.description}</p>
            
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="font-semibold text-blue-800 text-sm">
                    {work.duration}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Duration</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <ImageIcon className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="font-semibold text-blue-800">
                    {work.mediaCount || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Media</p>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <span className="font-semibold text-blue-800 text-sm">
                    {work.category}
                  </span>
                </div>
                <p className="text-xs text-gray-600">Category</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {work.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-accent-50 text-accent-700 text-xs rounded-full font-medium px-2 py-1"
                >
                  #{tag}
                </span>
              ))}
              {work.tags.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{work.tags.length - 3} more
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{displayTime}</span>
              <button
                onClick={handleContactPoster}
                className="btn-outline-sm flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Poster
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Regular card for explore variant
  if (variant === 'explore') {
    return (
      <Link href={`/work/${work.dTag}`}>
        <div className="culture-card group cursor-pointer overflow-hidden">
          {/* Work Image */}
          <div className="relative aspect-video">
            {work.imageUrl ? (
              <Image
                src={work.imageUrl}
                alt={`Work opportunity: ${work.title}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width:1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100">
                <Briefcase className="w-12 h-12 text-blue-400" />
              </div>
            )}
            
            {/* Job Type Badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(work.jobType)}`}>
                {getJobTypeIcon(work.jobType)} {work.jobType}
              </span>
            </div>

            {/* Pay Rate Badge */}
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formatPayRate(work.payRate, work.currency)}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-serif font-bold text-blue-800 mb-2 line-clamp-2">
              {work.title}
            </h3>
            
            <p className="text-gray-600 mb-4 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {work.location}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-3">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {work.duration}
                </span>
                <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium text-sm">
                  {work.category}
                </span>
              </div>
              <span>{displayTime}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {work.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="bg-accent-50 text-accent-700 text-xs rounded-full font-medium px-2 py-1"
                >
                  #{tag}
                </span>
              ))}
              {work.tags.length > 2 && (
                <span className="text-gray-500 text-xs">
                  +{work.tags.length - 2}
                </span>
              )}
            </div>
            
            <button
              onClick={handleContactPoster}
              className="w-full btn-outline-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Poster
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // My-work variant
  return (
    <div className="card overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Work Image */}
      <div className="relative aspect-[4/3] bg-blue-50">
        {work.imageUrl ? (
          <Image
            src={work.imageUrl}
            alt={work.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-blue-100">
            <Briefcase className="w-12 h-12 text-blue-400" />
          </div>
        )}
        
        {/* Job Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(work.jobType)}`}>
            {getJobTypeIcon(work.jobType)} {work.jobType}
          </span>
        </div>

        {/* Created Time Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {displayTime}
          </span>
        </div>
      </div>
      
      {/* Work Info */}
      <div className="p-6">
        <h3 className="text-xl font-serif font-bold text-blue-800 mb-2 line-clamp-2">
          {work.title}
        </h3>
        
        <p className="text-base mb-4 line-clamp-3 leading-relaxed text-blue-600">
          {work.description}
        </p>
        
        {/* Pay Rate */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-3 font-semibold">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span>{formatPayRate(work.payRate, work.currency)}</span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Calendar className="w-4 h-4" />
          <span>Duration: {work.duration}</span>
        </div>

        {/* Location and Region */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span>
            {work.location || work.region}
            {work.country && `, ${work.country}`}
          </span>
        </div>

        {/* Category */}
        <div className="mb-4">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium text-sm">
            {work.category}
          </span>
        </div>
        
        {/* Action Buttons - My Work */}
        <div className="flex gap-2">
          <a
            href={`/work/${work.dTag}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleView}
            className="btn-outline-sm flex items-center justify-center px-3"
            title="View work opportunity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </a>
          <button 
            onClick={handleEdit} 
            className="btn-primary-sm flex-1"
          >
            Edit
          </button>
          <button 
            onClick={handleDelete} 
            className="btn-danger-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
