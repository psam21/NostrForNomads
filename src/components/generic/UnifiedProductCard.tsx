import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, MessageCircle, Tag, DollarSign } from 'lucide-react';
import { logger } from '@/services/core/LoggingService';
import { getRelativeTime } from '@/utils/dateUtils';
import type { ProductCardData } from '@/types/shop';

interface UnifiedProductCardProps {
  product: ProductCardData;
  variant: 'shop' | 'my-shop';
  featured?: boolean;
  viewMode?: 'grid' | 'list';
  
  // Optional handlers for my-shop variant
  onEdit?: (product: ProductCardData) => void;
  onDelete?: (product: ProductCardData) => void;
}

/**
 * Unified Product Card Component
 * Displays products in both /shop and /my-shop pages
 * 
 * SOA Layer: Presentation (UI only, no business logic)
 * 
 * Variants:
 * - shop: Shows contact seller button, featured/grid/list layouts
 * - my-shop: Shows edit/delete/view buttons, grid layout only
 * 
 * Features:
 * - Responsive design (adapts to screen size)
 * - Featured variant for highlighted products (shop only)
 * - List/grid view modes (shop only)
 * - Conditional action buttons based on variant
 * - Shared price/currency/condition/category formatting
 */
export const UnifiedProductCard: React.FC<UnifiedProductCardProps> = ({ 
  product, 
  variant,
  featured = false,
  viewMode = 'grid',
  onEdit,
  onDelete
}) => {
  const router = useRouter();

  // Shared utility functions
  const getCurrencySymbol = (currency: string) => {
    if (currency === 'BTC') return '₿';
    if (currency === 'sats') return 'sats';
    if (currency === 'USD') return '$';
    return currency;
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = getCurrencySymbol(currency);
    if (currency === 'sats') {
      return `${price.toLocaleString()} ${symbol}`;
    }
    return `${symbol}${price.toLocaleString()}`;
  };

  const getConditionColor = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition === 'new') return 'bg-green-100 text-green-700';
    if (lowerCondition === 'used') return 'bg-blue-100 text-blue-700';
    if (lowerCondition === 'refurbished') return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'art': 'bg-pink-100 text-pink-700',
      'services': 'bg-blue-100 text-blue-700',
      'hardware': 'bg-gray-100 text-gray-700',
      'software': 'bg-cyan-100 text-cyan-700',
      'education': 'bg-purple-100 text-purple-700',
      'fashion': 'bg-rose-100 text-rose-700',
      'food': 'bg-orange-100 text-orange-700',
      'home': 'bg-green-100 text-green-700',
      'sports': 'bg-indigo-100 text-indigo-700',
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  // Handlers
  const handleContactSeller = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    logger.info('Contact seller clicked', {
      component: 'UnifiedProductCard',
      method: 'handleContactSeller',
      variant,
      productId: product.id,
      title: product.title,
    });

    const params = new URLSearchParams({
      recipient: product.pubkey,
      context: `product:${product.id}`,
      contextTitle: product.title || 'Product',
      ...(product.imageUrl && { contextImage: product.imageUrl }),
    });

    router.push(`/messages?${params.toString()}`);
  };

  const handleEdit = () => {
    logger.info('Edit product clicked', {
      component: 'UnifiedProductCard',
      method: 'handleEdit',
      variant,
      productId: product.id,
      title: product.title,
    });
    onEdit?.(product);
  };

  const handleDelete = () => {
    logger.info('Delete product clicked', {
      component: 'UnifiedProductCard',
      method: 'handleDelete',
      variant,
      productId: product.id,
      title: product.title,
    });
    onDelete?.(product);
  };

  const handleView = () => {
    logger.info('View product clicked', {
      component: 'UnifiedProductCard',
      method: 'handleView',
      variant,
      productId: product.id,
      dTag: product.dTag,
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    logger.warn('Product image failed to load', {
      component: 'UnifiedProductCard',
      method: 'handleImageError',
      variant,
      productId: product.id,
      imageUrl: product.imageUrl,
    });
    
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="w-full h-full flex items-center justify-center bg-purple-100">
          <svg class="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
        </div>
      `;
    }
  };

  // My-shop variant (grid only)
  if (variant === 'my-shop') {
    return (
      <div className="card overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Product Image */}
        <div className="relative aspect-[4/3] bg-purple-50">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-100">
              <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          )}
          
          {/* Price Badge - Top Left */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-white/95 backdrop-blur-sm text-purple-900 shadow-lg">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>

          {/* Created Time Badge - Top Right */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getRelativeTime(product.createdAt)}
            </span>
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-6">
          <h3 className="text-xl font-serif font-bold text-purple-800 mb-2 line-clamp-2">
            {product.title}
          </h3>
          
          <p className="text-base mb-4 line-clamp-3 leading-relaxed text-purple-600">
            {product.description}
          </p>
          
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <MapPin className="w-4 h-4" />
            <span>{product.location}</span>
          </div>

          {/* Condition and Category */}
          <div className="mb-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full font-medium text-sm ${getCategoryColor(product.category)}`}>
              {product.category}
            </span>
            <span className={`px-3 py-1 rounded-full font-medium text-sm ${getConditionColor(product.condition)}`}>
              {product.condition}
            </span>
          </div>
          
          {/* Action Buttons - My Shop */}
          <div className="flex gap-2">
            <a
              href={`/shop/${product.dTag}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleView}
              className="btn-outline-sm flex items-center justify-center px-3"
              title="View product"
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
  }

  // Shop variant - Featured layout
  if (featured && variant === 'shop') {
    return (
      <Link href={`/shop/${product.dTag}`}>
        <div className="culture-card group p-0 overflow-hidden cursor-pointer">
          {/* Featured Product Image */}
          <div className="relative aspect-video">
            <Image
              src={product.imageUrl || '/placeholder-product.jpg'}
              alt={product.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
            
            <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Featured
            </div>
            
            {/* Price Badge */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-purple-900">{formatPrice(product.price, product.currency)}</span>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/50 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {product.location}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-serif font-bold text-purple-800 mb-2 line-clamp-2">
              {product.title}
            </h3>
            
            <p className="text-gray-700 mb-4 line-clamp-3">{product.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                {product.category}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(product.condition)}`}>
                {product.condition}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-accent-50 text-accent-700 text-xs rounded-full font-medium px-2 py-1"
                >
                  #{tag}
                </span>
              ))}
              {product.tags.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{product.tags.length - 3} more
                </span>
              )}
            </div>
            
            <button
              onClick={handleContactSeller}
              className="btn btn-outline w-full flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Seller
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Shop variant - List view
  if (viewMode === 'list' && variant === 'shop') {
    return (
      <Link href={`/shop/${product.dTag}`}>
        <div className="culture-card group cursor-pointer flex gap-4 hover:shadow-lg transition-shadow">
          {/* Product Image */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <Image
              src={product.imageUrl || '/placeholder-product.jpg'}
              alt={product.title}
              fill
              sizes="192px"
              className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
            
            {/* Price Badge */}
            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-purple-600" />
              <span className="font-bold text-sm text-purple-900">{formatPrice(product.price, product.currency)}</span>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="flex-1 flex flex-col justify-between py-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                {product.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                  {product.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getConditionColor(product.condition)}`}>
                  {product.condition}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{product.location}</span>
              </div>
              
              <button
                onClick={handleContactSeller}
                className="btn btn-outline btn-sm flex items-center gap-2"
              >
                <MessageCircle className="w-3 h-3" />
                Contact
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Shop variant - Grid view (default)
  return (
    <Link href={`/shop/${product.dTag}`}>
      <div className="culture-card group cursor-pointer hover:shadow-xl transition-all duration-300">
        {/* Product Image */}
        <div className="relative aspect-[4/3] bg-gray-50 rounded-t-lg overflow-hidden">
          <Image
            src={product.imageUrl || '/placeholder-product.jpg'}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
          
          {/* Price Badge Overlay */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <span className="font-bold text-purple-900">{formatPrice(product.price, product.currency)}</span>
          </div>
        </div>
        
        {/* Product Content */}
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {product.title}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
              {product.category}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(product.condition)}`}>
              {product.condition}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{product.location}</span>
            </div>
            {product.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>{product.tags.length}</span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleContactSeller}
            className="btn btn-outline w-full text-sm flex items-center justify-center gap-2 mt-2"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Seller
          </button>
        </div>
      </div>
    </Link>
  );
};
