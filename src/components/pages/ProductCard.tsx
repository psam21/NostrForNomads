import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, MessageCircle, Tag, DollarSign } from 'lucide-react';
import { logger } from '@/services/core/LoggingService';
import type { ProductExploreItem } from '@/types/shop';

interface ProductCardProps {
  product: ProductExploreItem;
  featured?: boolean;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  featured = false,
  viewMode = 'grid'
}) => {
  const router = useRouter();

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

  const handleContactSeller = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    logger.info('Contact seller clicked', {
      component: 'ProductCard',
      method: 'handleContactSeller',
      productId: product.id,
      title: product.title,
    });

    // Navigate to messages with context
    const params = new URLSearchParams({
      recipient: product.pubkey,
      context: `product:${product.id}`,
      contextTitle: product.title || 'Product',
      ...(product.imageUrl && { contextImage: product.imageUrl }),
    });

    router.push(`/messages?${params.toString()}`);
  };

  // Featured Card Layout
  if (featured) {
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
              onError={() => {
                logger.warn('Product image failed to load', {
                  component: 'ProductCard',
                  productId: product.id,
                  imageUrl: product.imageUrl,
                });
              }}
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

  // List View Layout
  if (viewMode === 'list') {
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
              onError={() => {
                logger.warn('Product image failed to load', {
                  component: 'ProductCard',
                  productId: product.id,
                  imageUrl: product.imageUrl,
                });
              }}
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

  // Grid View Layout (default)
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
            onError={() => {
              logger.warn('Product image failed to load', {
                component: 'ProductCard',
                productId: product.id,
                imageUrl: product.imageUrl,
              });
            }}
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
