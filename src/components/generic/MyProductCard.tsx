import React from 'react';
import Image from 'next/image';
import { Clock, MapPin, DollarSign } from 'lucide-react';
import { logger } from '@/services/core/LoggingService';
import type { ProductCardData } from '@/types/shop';
import { getRelativeTime } from '@/utils/dateUtils';

interface MyProductCardProps {
  product: ProductCardData;
  onEdit: (product: ProductCardData) => void;
  onDelete: (product: ProductCardData) => void;
}

/**
 * My Product Card Component
 * Displays user's product in my-shop dashboard
 * 
 * SOA Layer: Presentation (UI only, no business logic)
 */
export const MyProductCard: React.FC<MyProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete
}) => {
  const getConditionColor = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition === 'new') {
      return 'bg-green-100 text-green-700';
    }
    if (lowerCondition === 'used') {
      return 'bg-blue-100 text-blue-700';
    }
    if (lowerCondition === 'refurbished') {
      return 'bg-purple-100 text-purple-700';
    }
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

  const handleEdit = () => {
    logger.info('Edit product clicked', {
      component: 'MyProductCard',
      method: 'handleEdit',
      productId: product.id,
      title: product.title,
    });
    onEdit(product);
  };

  const handleDelete = () => {
    logger.info('Delete product clicked', {
      component: 'MyProductCard',
      method: 'handleDelete',
      productId: product.id,
      title: product.title,
    });
    onDelete(product);
  };

  const handleView = () => {
    logger.info('View product clicked', {
      component: 'MyProductCard',
      method: 'handleView',
      productId: product.id,
      dTag: product.dTag,
    });
  };

  return (
    <div className="card overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-gray-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            width={400}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              logger.warn('Product image failed to load', {
                component: 'MyProductCard',
                method: 'handleImageError',
                productId: product.id,
                imageUrl: product.imageUrl,
              });
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Price Badge Overlay */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-purple-600" />
          <span className="font-bold text-purple-900">{formatPrice(product.price, product.currency)}</span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
            {product.category}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(product.condition)}`}>
            {product.condition}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{product.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{getRelativeTime(product.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <a
            href={`/shop/${product.dTag}`}
            onClick={handleView}
            className="btn btn-outline flex-1 text-sm"
          >
            View
          </a>
          <button
            onClick={handleEdit}
            className="btn btn-outline flex-1 text-sm"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger flex-1 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
