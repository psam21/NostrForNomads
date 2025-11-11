'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  FileText,
  Lightbulb,
  Star,
  CheckCircle,
  Globe,
  Users,
} from 'lucide-react';
import { ContributionForm } from '@/components/pages/ContributionForm';

// Nomad contribution types
const contributionTypes = [
  {
    icon: MapPin,
    title: 'Travel Experiences',
    description:
      'Share your nomadic journey, adventures, and the places that left an impact on you.',
    examples: [
      'Destination stories',
      'Travel mishaps',
      'Cultural encounters',
      'Hidden gems',
    ],
  },
  {
    icon: FileText,
    title: 'Guides & Tutorials',
    description:
      'Help other nomads with practical how-to guides and step-by-step instructions.',
    examples: ['Visa processes', 'Setup guides', 'Travel hacks', 'Budget tips'],
  },
  {
    icon: Star,
    title: 'Reviews & Recommendations',
    description:
      'Review places, services, and products that help nomads make better decisions.',
    examples: [
      'Coworking spaces',
      'Accommodations',
      'Digital services',
      'Local services',
    ],
  },
  {
    icon: Lightbulb,
    title: 'Tips & Resources',
    description:
      'Share valuable tips, tools, and resources that make nomadic life easier.',
    examples: [
      'Productivity tips',
      'Health advice',
      'Safety resources',
      'Community tools',
    ],
  },
];

const uploadSteps = [
  {
    number: 1,
    title: 'Choose Your Type',
    description: 'Select the type of nomadic contribution you want to share.',
  },
  {
    number: 2,
    title: 'Add Details',
    description: 'Provide context, location, and practical details to help others.',
  },
  {
    number: 3,
    title: 'Add Media',
    description: 'Enhance your contribution with photos, videos, or other media.',
  },
  {
    number: 4,
    title: 'Share & Connect',
    description: 'Your knowledge joins the global community of digital nomads.',
  },
];

export default function ContributeContent() {
  const [selectedType, setSelectedType] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-orange-400 to-orange-600 text-white">
        <div className="container-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container-width text-center"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              Share Your <span className="text-white">Nomad Experience</span>
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 leading-relaxed mb-8">
              Help fellow nomads by sharing your experiences, tips, and knowledge. Build the global
              community of location-independent professionals.
            </p>
            <div className="flex items-center justify-center space-x-6 text-orange-200">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>Build Community</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                <span>Share Knowledge</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Help Others</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contribution Types */}
      <section className="section-padding bg-white">
        <div className="container-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-purple-800 mb-4">
              What Can You Contribute?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the type of contribution you want to share. Your knowledge helps the nomad
              community thrive.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contributionTypes.map((type, index) => {
              const Icon = type.icon;
              const active = selectedType === index;
              return (
                <motion.button
                  key={type.title}
                  type="button"
                  onClick={() => setSelectedType(index)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`p-6 rounded-xl border transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    active
                      ? 'bg-purple-800 text-white border-purple-700 shadow-lg'
                      : 'bg-white hover:shadow-md border-gray-200'
                  }`}
                  aria-pressed={active}
                >
                  <Icon
                    className={`w-8 h-8 mb-4 ${active ? 'text-orange-300' : 'text-purple-700'}`}
                  />
                  <h3 className="font-serif font-bold text-lg mb-2">{type.title}</h3>
                  <p
                    className={`text-sm mb-3 leading-relaxed ${active ? 'text-orange-100' : 'text-gray-600'}`}
                  >
                    {type.description}
                  </p>
                  <ul
                    className={`text-xs space-y-1 ${active ? 'text-orange-200' : 'text-gray-500'}`}
                  >
                    {type.examples.map((ex) => (
                      <li key={ex} className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-2" /> {ex}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contribution Form */}
      {selectedType !== null && (
        <section className="section-padding bg-gray-50">
          <div className="container-width">
            <ContributionForm />
          </div>
        </section>
      )}

      {/* Process Steps */}
      <section className="section-padding bg-white">
        <div className="container-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-purple-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our simple process makes it easy to share your knowledge with the nomad community.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {uploadSteps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-purple-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
