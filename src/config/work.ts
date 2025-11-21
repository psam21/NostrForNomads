/**
 * Work opportunity configuration
 * Defines work categories, job types, durations, and currencies
 */

export interface WorkCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface WorkJobType {
  id: string;
  name: string;
  icon: string;
}

export interface WorkDuration {
  id: string;
  name: string;
  value: string;
}

export interface WorkCurrency {
  id: string;
  name: string;
  symbol: string;
  description: string;
}

// Work Categories
export const WORK_CATEGORIES: WorkCategory[] = [
  {
    id: 'development',
    name: 'Development',
    description: 'Software development, coding, and programming',
    icon: '💻',
  },
  {
    id: 'design',
    name: 'Design',
    description: 'UI/UX design, graphic design, and creative work',
    icon: '🎨',
  },
  {
    id: 'writing',
    name: 'Writing',
    description: 'Content writing, copywriting, and documentation',
    icon: '✍️',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Digital marketing, SEO, and social media',
    icon: '📢',
  },
  {
    id: 'support',
    name: 'Support',
    description: 'Customer support and community management',
    icon: '🤝',
  },
  {
    id: 'consulting',
    name: 'Consulting',
    description: 'Business consulting, strategy, and advisory',
    icon: '💡',
  },
  {
    id: 'video',
    name: 'Video & Media',
    description: 'Video editing, production, and media creation',
    icon: '🎬',
  },
  {
    id: 'translation',
    name: 'Translation',
    description: 'Language translation and localization',
    icon: '🌐',
  },
  {
    id: 'data',
    name: 'Data & Analytics',
    description: 'Data analysis, research, and business intelligence',
    icon: '📊',
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Other types of work opportunities',
    icon: '🔧',
  },
];

// Job Types
export const WORK_JOB_TYPES: WorkJobType[] = [
  {
    id: 'remote',
    name: 'Remote',
    icon: '🌍',
  },
  {
    id: 'on-site',
    name: 'On-site',
    icon: '🏢',
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    icon: '🔄',
  },
];

// Durations
export const WORK_DURATIONS: WorkDuration[] = [
  {
    id: '1-week',
    name: '1 Week',
    value: '1-week',
  },
  {
    id: '2-weeks',
    name: '2 Weeks',
    value: '2-weeks',
  },
  {
    id: '1-month',
    name: '1 Month',
    value: '1-month',
  },
  {
    id: '2-months',
    name: '2 Months',
    value: '2-months',
  },
  {
    id: '3-months',
    name: '3 Months',
    value: '3-months',
  },
  {
    id: '6-months',
    name: '6 Months',
    value: '6-months',
  },
  {
    id: '1-year',
    name: '1 Year',
    value: '1-year',
  },
  {
    id: 'ongoing',
    name: 'Ongoing',
    value: 'ongoing',
  },
];

// Currencies
export const WORK_CURRENCIES: WorkCurrency[] = [
  {
    id: 'btc',
    name: 'BTC',
    symbol: '₿',
    description: 'Bitcoin',
  },
  {
    id: 'sats',
    name: 'Sats',
    symbol: 'sats',
    description: 'Satoshis',
  },
  {
    id: 'usd',
    name: 'USD',
    symbol: '$',
    description: 'US Dollars',
  },
  {
    id: 'per-hour',
    name: 'Per Hour',
    symbol: '/hr',
    description: 'Hourly rate',
  },
  {
    id: 'per-day',
    name: 'Per Day',
    symbol: '/day',
    description: 'Daily rate',
  },
  {
    id: 'per-project',
    name: 'Per Project',
    symbol: '/project',
    description: 'Project-based payment',
  },
];

// Helper functions
export const getWorkCategoryById = (id: string): WorkCategory | undefined => {
  return WORK_CATEGORIES.find(category => category.id === id);
};

export const getWorkJobTypeById = (id: string): WorkJobType | undefined => {
  return WORK_JOB_TYPES.find(jobType => jobType.id === id);
};

export const getWorkDurationById = (id: string): WorkDuration | undefined => {
  return WORK_DURATIONS.find(duration => duration.id === id);
};

export const getWorkCurrencyById = (id: string): WorkCurrency | undefined => {
  return WORK_CURRENCIES.find(currency => currency.id === id);
};

// Export getter functions for form usage
export const getWorkCategories = (): WorkCategory[] => {
  return WORK_CATEGORIES;
};

export const getWorkJobTypes = (): WorkJobType[] => {
  return WORK_JOB_TYPES;
};

export const getWorkDurations = (): WorkDuration[] => {
  return WORK_DURATIONS;
};

export const getWorkCurrencies = (): WorkCurrency[] => {
  return WORK_CURRENCIES;
};
