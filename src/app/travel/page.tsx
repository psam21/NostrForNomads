'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAuthHydration } from '@/hooks/useAuthHydration';
import { Plane, Search, Filter, MapPin, DollarSign, Star, Users, Home } from 'lucide-react';

interface TravelListing {
  id: string;
  title: string;
  description: string;
  type: 'Accommodation' | 'Flight' | 'Experience' | 'Transport';
  location: string;
  host: string;
  price: number;
  currency: 'BTC' | 'sats' | 'USD' | 'per night' | 'per person';
  capacity?: number;
  rating?: number;
  image?: string;
  category: string;
  available: boolean;
}

export default function TravelPage() {
  const isHydrated = useAuthHydration();
  const { isAuthenticated } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sample listings - in real app this would come from API/Nostr
  const [listings] = useState<TravelListing[]>([
    {
      id: '1',
      title: 'Cozy Beach Apartment',
      description: 'Beautiful beachfront apartment with ocean views, perfect for digital nomads',
      type: 'Accommodation',
      location: 'Bali, Indonesia',
      host: 'beach_host',
      price: 50,
      currency: 'per night',
      capacity: 2,
      rating: 4.9,
      category: 'Apartment',
      available: true,
    },
    {
      id: '2',
      title: 'Bitcoin Conference Shuttle',
      description: 'Shared transport service to Bitcoin 2025 conference',
      type: 'Transport',
      location: 'Miami, FL',
      host: 'crypto_transport',
      price: 25000,
      currency: 'sats',
      capacity: 6,
      rating: 4.7,
      category: 'Shuttle',
      available: true,
    },
    {
      id: '3',
      title: 'Mountain Hiking Tour',
      description: 'Guided hiking experience in the Swiss Alps with local guide',
      type: 'Experience',
      location: 'Interlaken, Switzerland',
      host: 'alpine_guide',
      price: 0.002,
      currency: 'BTC',
      capacity: 8,
      rating: 5,
      category: 'Adventure',
      available: true,
    },
    {
      id: '4',
      title: 'Private Villa with Pool',
      description: 'Luxury villa with private pool and mountain views',
      type: 'Accommodation',
      location: 'Lisbon, Portugal',
      host: 'villa_owner',
      price: 150,
      currency: 'per night',
      capacity: 6,
      rating: 4.8,
      category: 'Villa',
      available: true,
    },
  ]);

  const types = ['all', 'Accommodation', 'Flight', 'Experience', 'Transport'];
  const categories = ['all', 'Apartment', 'Villa', 'Hostel', 'Hotel', 'Adventure', 'Cultural', 'Shuttle', 'Private Car'];

  // Wait for auth store to hydrate
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show sign-in prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50">
        <div className="text-center max-w-md px-6">
          <Plane className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-purple-900 mb-2">
            Sign in to access Travel
          </h2>
          <p className="text-purple-600 mb-6">
            Book accommodations, experiences, and transport on Nostr
          </p>
          <a
            href="/signin"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || listing.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50">
      <div className="container-width section-padding">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-purple-800 flex items-center gap-3">
            <Plane className="w-8 h-8" />
            Travel
          </h1>
          <p className="text-orange-600 mt-2 font-medium">
            Book accommodations, experiences, and transport on the decentralized network
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by destination, title, or description..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <div
                key={listing.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Listing Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
                  {listing.type === 'Accommodation' ? (
                    <Home className="w-16 h-16 text-purple-300" />
                  ) : listing.type === 'Transport' ? (
                    <Plane className="w-16 h-16 text-purple-300" />
                  ) : (
                    <MapPin className="w-16 h-16 text-purple-300" />
                  )}
                </div>

                {/* Listing Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-purple-900 line-clamp-1">
                      {listing.title}
                    </h3>
                    {listing.available && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full whitespace-nowrap ml-2">
                        Available
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.location}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    {listing.capacity && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Up to {listing.capacity}</span>
                      </div>
                    )}
                    {listing.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{listing.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {listing.type}
                    </span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                      {listing.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <span className="text-2xl font-bold text-purple-800">
                          {listing.price}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">{listing.currency}</span>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium">
                      Book
                    </button>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    by {listing.host}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List Your Property CTA */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Have a place or service to offer?</h3>
              <p className="text-purple-100">
                List your accommodation, experience, or transport on Nostr
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium whitespace-nowrap">
              List Your Offering
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">
            ✈️ About Travel
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>Decentralized travel marketplace powered by Nostr</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>Pay with Bitcoin, Lightning, or other modes of Payment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>Connect directly with hosts via Nostr messages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>Build trust through your Nostr reputation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-0.5">•</span>
              <span>Book accommodations, experiences, flights, and local transport</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
