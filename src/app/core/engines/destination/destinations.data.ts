/**
 * DEPRECATED: Destinations Data (Static)
 * ======================================
 * 
 * This file is NO LONGER USED.
 * 
 * All destination data is now stored in MongoDB Atlas.
 * 
 * Frontend fetches destinations via API:
 * GET /api/destinations
 * 
 * For development, use the MongoDB seed endpoint:
 * GET /api/seed-destinations
 * 
 * See: MONGODB_MIGRATION_GUIDE.md for setup instructions
 */

// Type definitions maintained for backward compatibility
export type DestinationType = 'beach' | 'hill' | 'city' | 'heritage' | 'island' | 'wildlife' | 'spiritual';

export type DestinationCategory = 
  | 'Beach' | 'Mountain' | 'Hill' | 'Heritage' | 'Spiritual'
  | 'Adventure' | 'Nature' | 'Wildlife' | 'City' | 'Coastal'
  | 'Backwaters' | 'Party' | 'Romantic' | 'Snow' | 'Ski'
  | 'Colonial' | 'Island' | 'Culture' | 'Lake';

export type ClimateType = 
  | 'tropical' | 'cold' | 'hot' | 'moderate' | 'humid'
  | 'cool' | 'extreme' | 'cold_desert' | 'wet';

export type BudgetType = 'budget' | 'moderate' | 'premium';

export interface ExperienceScores {
  beach?: number;
  adventure?: number;
  relaxation?: number;
  nightlife?: number;
  family?: number;
  couple?: number;
  cultural?: number;
  spiritual?: number;
  nature?: number;
  wildlife?: number;
  heritage?: number;
  [key: string]: number | undefined;
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  country: string;
  type: DestinationType;
  categories: DestinationCategory[];
  bestMonths: number[];
  avoidMonths: number[];
  climate: ClimateType;
  budget: BudgetType;
  scores: ExperienceScores;
  agoda: string;
}

// ⚠️ EMPTY - All data now in MongoDB
export const DESTINATIONS_DATA: Record<string, Destination> = {};// ⚠️ EMPTY - All data now in MongoDB
export const DESTINATIONS_DATA: Record<string, Destination> = {};

    avoidMonths: [6, 7, 8, 9],
    climate: 'tropical',
    budget: 'moderate',
    scores: { beach: 90, nightlife: 85, party: 88, relaxation: 75, adventure: 60 },
    agoda: 'palolem-in'
  },
  'anjuna-goa': {
    id: 'anjuna-goa',
    name: 'Anjuna',
    state: 'Goa',
    country: 'India',
    type: 'beach',
    categories: ['Beach', 'Party'],
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [6, 7, 8, 9],
    climate: 'tropical',
    budget: 'moderate',
    scores: { beach: 85, nightlife: 88, party: 90, adventure: 65, relaxation: 70 },
    agoda: 'anjuna-in'
  },
  'baga-goa': {
    id: 'baga-goa',
    name: 'Baga',
    state: 'Goa',
    country: 'India',
    type: 'beach',
    categories: ['Beach', 'Party'],
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [6, 7, 8, 9],
    climate: 'tropical',
    budget: 'moderate',
    scores: { beach: 82, nightlife: 85, party: 87, adventure: 70, family: 60 },
    agoda: 'baga-in'
  },
  'pondicherry': {
    id: 'pondicherry',
    name: 'Pondicherry',
    state: 'Puducherry',
    country: 'India',
    type: 'beach',
    categories: ['Beach', 'Culture', 'Colonial'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7, 8],
    climate: 'humid',
    budget: 'moderate',
    scores: { beach: 75, cultural: 88, heritage: 85, romance: 82, relaxation: 80 },
    agoda: 'pondicherry-in'
  },
  'kovalam': {
    id: 'kovalam',
    name: 'Kovalam',
    state: 'Kerala',
    country: 'India',
    type: 'beach',
    categories: ['Beach', 'Relaxation'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7, 8],
    climate: 'tropical',
    budget: 'moderate',
    scores: { beach: 85, relaxation: 92, family: 80, romance: 80, nightlife: 50 },
    agoda: 'kovalam-in'
  },
  'alleppey': {
    id: 'alleppey',
    name: 'Alleppey (Alappuzha)',
    state: 'Kerala',
    country: 'India',
    type: 'beach',
    categories: ['Backwaters', 'Beach'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7, 8],
    climate: 'tropical',
    budget: 'moderate',
    scores: { relaxation: 88, family: 85, romance: 85, nature: 80, beach: 70 },
    agoda: 'alleppey-in'
  },
  'havelock-andaman': {
    id: 'havelock-andaman',
    name: 'Havelock Island',
    state: 'Andaman & Nicobar',
    country: 'India',
    type: 'island',
    categories: ['Island', 'Beach', 'Adventure'],
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [6, 7, 8],
    climate: 'tropical',
    budget: 'premium',
    scores: { beach: 98, adventure: 92, family: 85, relaxation: 80, wildlife: 75 },
    agoda: 'havelock-in'
  },
  'neil-andaman': {
    id: 'neil-andaman',
    name: 'Neil Island',
    state: 'Andaman & Nicobar',
    country: 'India',
    type: 'island',
    categories: ['Island', 'Beach'],
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [6, 7, 8],
    climate: 'tropical',
    budget: 'premium',
    scores: { beach: 90, relaxation: 92, family: 82, adventure: 70, romance: 85 },
    agoda: 'neil-in'
  },

  /* =====================
     HILL DESTINATIONS
  ===================== */
  'manali': {
    id: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    country: 'India',
    type: 'hill',
    categories: ['Mountain', 'Adventure', 'Snow'],
    bestMonths: [3, 4, 5, 10, 11],
    avoidMonths: [7, 8],
    climate: 'cold',
    budget: 'budget',
    scores: { adventure: 92, nature: 88, relaxation: 75, family: 80, couple: 85 },
    agoda: 'manali-in'
  },
  'shimla': {
    id: 'shimla',
    name: 'Shimla',
    state: 'Himachal Pradesh',
    country: 'India',
    type: 'hill',
    categories: ['Hill', 'Colonial'],
    bestMonths: [3, 4, 5, 10, 11],
    avoidMonths: [7, 8],
    climate: 'cold',
    budget: 'budget',
    scores: { nature: 85, heritage: 80, family: 85, couple: 80, relaxation: 75 },
    agoda: 'shimla-in'
  },
  'mussoorie': {
    id: 'mussoorie',
    name: 'Mussoorie',
    state: 'Uttarakhand',
    country: 'India',
    type: 'hill',
    categories: ['Hill', 'Colonial'],
    bestMonths: [3, 4, 5, 10, 11],
    avoidMonths: [7, 8],
    climate: 'cool',
    budget: 'moderate',
    scores: { nature: 82, heritage: 78, family: 80, couple: 82, adventure: 70 },
    agoda: 'mussoorie-in'
  },
  'nainital': {
    id: 'nainital',
    name: 'Nainital',
    state: 'Uttarakhand',
    country: 'India',
    type: 'hill',
    categories: ['Hill', 'Lake'],
    bestMonths: [3, 4, 5, 10, 11],
    avoidMonths: [7, 8],
    climate: 'cool',
    budget: 'moderate',
    scores: { family: 88, nature: 82, romance: 80, adventure: 75, relaxation: 78 },
    agoda: 'nainital-in'
  },
  'munnar': {
    id: 'munnar',
    name: 'Munnar',
    state: 'Kerala',
    country: 'India',
    type: 'hill',
    categories: ['Hill', 'Nature'],
    bestMonths: [9, 10, 11, 12, 1],
    avoidMonths: [6, 7],
    climate: 'cool',
    budget: 'moderate',
    scores: { nature: 95, relaxation: 88, family: 82, adventure: 70, couple: 85 },
    agoda: 'munnar-in'
  },
  'coorg': {
    id: 'coorg',
    name: 'Coorg (Kodagu)',
    state: 'Karnataka',
    country: 'India',
    type: 'hill',
    categories: ['Hill', 'Nature'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'cool',
    budget: 'moderate',
    scores: { nature: 90, adventure: 80, relaxation: 82, family: 80, couple: 85 },
    agoda: 'coorg-in'
  },
  'ooty': {
    id: 'ooty',
    name: 'Ooty (Udhagamandalam)',
    state: 'Tamil Nadu',
    country: 'India',
    type: 'hill',
    categories: ['Hill', 'Colonial'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'cool',
    budget: 'moderate',
    scores: { nature: 88, family: 88, heritage: 75, adventure: 70, couple: 82 },
    agoda: 'ooty-in'
  },
  'kodaikanal': {
    id: 'kodaikanal',
    name: 'Kodaikanal',
    state: 'Tamil Nadu',
    country: 'India',
    type: 'hill',
    categories: ['Hill', 'Lake'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'cool',
    budget: 'moderate',
    scores: { family: 88, nature: 85, romance: 85, adventure: 75, relaxation: 82 },
    agoda: 'kodaikanal-in'
  },
  'darjeeling': {
    id: 'darjeeling',
    name: 'Darjeeling',
    state: 'West Bengal',
    country: 'India',
    type: 'hill',
    categories: ['Hill', 'Colonial', 'Culture'],
    bestMonths: [3, 4, 5, 10, 11],
    avoidMonths: [7, 8],
    climate: 'cool',
    budget: 'moderate',
    scores: { heritage: 85, culture: 82, nature: 80, family: 78, adventure: 70 },
    agoda: 'darjeeling-in'
  },
  'gangtok': {
    id: 'gangtok',
    name: 'Gangtok',
    state: 'Sikkim',
    country: 'India',
    type: 'hill',
    categories: ['Hill', 'Nature'],
    bestMonths: [3, 4, 5, 10, 11],
    avoidMonths: [7, 8],
    climate: 'cool',
    budget: 'moderate',
    scores: { nature: 85, adventure: 80, culture: 78, family: 75, relaxation: 75 },
    agoda: 'gangtok-in'
  },
  'lonavala': {
    id: 'lonavala',
    name: 'Lonavala',
    state: 'Maharashtra',
    country: 'India',
    type: 'hill',
    categories: ['Hill', 'Adventure'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [7, 8],
    climate: 'cool',
    budget: 'budget',
    scores: { adventure: 82, family: 80, nature: 78, couple: 75, relaxation: 72 },
    agoda: 'lonavala-in'
  },
  'mahabaleshwar': {
    id: 'mahabaleshwar',
    name: 'Mahabaleshwar',
    state: 'Maharashtra',
    country: 'India',
    type: 'hill',
    categories: ['Hill', 'Nature'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [7, 8],
    climate: 'cool',
    budget: 'moderate',
    scores: { nature: 88, family: 82, adventure: 75, relaxation: 80, couple: 78 },
    agoda: 'mahabaleshwar-in'
  },
  'mount-abu': {
    id: 'mount-abu',
    name: 'Mount Abu',
    state: 'Rajasthan',
    country: 'India',
    type: 'hill',
    categories: ['Hill', 'Spiritual'],
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [5, 6],
    climate: 'cool',
    budget: 'moderate',
    scores: { nature: 85, spiritual: 82, family: 80, couple: 78, relaxation: 75 },
    agoda: 'mount-abu-in'
  },
  'shillong': {
    id: 'shillong',
    name: 'Shillong',
    state: 'Meghalaya',
    country: 'India',
    type: 'hill',
    categories: ['Nature', 'Hill'],
    bestMonths: [10, 11, 12, 3, 4],
    avoidMonths: [6, 7],
    climate: 'cool',
    budget: 'budget',
    scores: { nature: 92, culture: 75, family: 78, adventure: 72, relaxation: 75 },
    agoda: 'shillong-in'
  },

  /* =====================
     HERITAGE/CULTURAL
  ===================== */
  'jaipur': {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    type: 'heritage',
    categories: ['Heritage', 'City', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    scores: { heritage: 95, culture: 90, family: 80, couple: 80, city: 85 },
    agoda: 'jaipur-in'
  },
  'agra': {
    id: 'agra',
    name: 'Agra',
    state: 'Uttar Pradesh',
    country: 'India',
    type: 'heritage',
    categories: ['Heritage'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    scores: { heritage: 98, culture: 92, family: 75, couple: 85, city: 75 },
    agoda: 'agra-in'
  },
  'udaipur': {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    type: 'heritage',
    categories: ['Heritage', 'Romantic', 'Lake'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'moderate',
    scores: { heritage: 90, romance: 95, family: 80, culture: 85, couple: 92 },
    agoda: 'udaipur-in'
  },
  'jodhpur': {
    id: 'jodhpur',
    name: 'Jodhpur',
    state: 'Rajasthan',
    country: 'India',
    type: 'heritage',
    categories: ['Heritage', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    scores: { heritage: 92, culture: 88, family: 78, couple: 82, adventure: 65 },
    agoda: 'jodhpur-in'
  },
  'hampi': {
    id: 'hampi',
    name: 'Hampi',
    state: 'Karnataka',
    country: 'India',
    type: 'heritage',
    categories: ['Heritage', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    scores: { heritage: 95, culture: 90, adventure: 75, family: 75, couple: 78 },
    agoda: 'hampi-in'
  },
  'mysore': {
    id: 'mysore',
    name: 'Mysore',
    state: 'Karnataka',
    country: 'India',
    type: 'heritage',
    categories: ['Heritage', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'moderate',
    budget: 'budget',
    scores: { heritage: 88, culture: 85, family: 82, couple: 80, adventure: 60 },
    agoda: 'mysore-in'
  },
  'delhi': {
    id: 'delhi',
    name: 'Delhi',
    state: 'Delhi',
    country: 'India',
    type: 'city',
    categories: ['City', 'Heritage', 'Culture'],
    bestMonths: [10, 11, 12, 2, 3],
    avoidMonths: [5, 6],
    climate: 'extreme',
    budget: 'budget',
    scores: { heritage: 85, culture: 90, city: 95, family: 78, couple: 75 },
    agoda: 'new-delhi-in'
  },
  'khajuraho': {
    id: 'khajuraho',
    name: 'Khajuraho',
    state: 'Madhya Pradesh',
    country: 'India',
    type: 'heritage',
    categories: ['Heritage', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    scores: { heritage: 93, culture: 88, couple: 80, family: 72, adventure: 55 },
    agoda: 'khajuraho-in'
  },
  'madurai': {
    id: 'madurai',
    name: 'Madurai',
    state: 'Tamil Nadu',
    country: 'India',
    type: 'heritage',
    categories: ['Heritage', 'Spiritual', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    scores: { spiritual: 88, heritage: 85, culture: 88, family: 80, couple: 72 },
    agoda: 'madurai-in'
  },
  'kochi': {
    id: 'kochi',
    name: 'Kochi',
    state: 'Kerala',
    country: 'India',
    type: 'city',
    categories: ['City', 'Culture', 'Coastal'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'tropical',
    budget: 'moderate',
    scores: { culture: 88, heritage: 82, family: 80, couple: 80, city: 85 },
    agoda: 'kochi-in'
  },

  /* =====================
     SPIRITUAL DESTINATIONS
  ===================== */
  'varanasi': {
    id: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    type: 'spiritual',
    categories: ['Spiritual', 'Culture', 'Heritage'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    scores: { spiritual: 98, culture: 92, heritage: 88, family: 70, couple: 72 },
    agoda: 'varanasi-in'
  },
  'rishikesh': {
    id: 'rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    country: 'India',
    type: 'spiritual',
    categories: ['Spiritual', 'Adventure'],
    bestMonths: [2, 3, 4, 9, 10, 11],
    avoidMonths: [7, 8],
    climate: 'moderate',
    budget: 'budget',
    scores: { spiritual: 92, adventure: 85, relaxation: 80, family: 75, couple: 80 },
    agoda: 'rishikesh-in'
  },
  'haridwar': {
    id: 'haridwar',
    name: 'Haridwar',
    state: 'Uttarakhand',
    country: 'India',
    type: 'spiritual',
    categories: ['Spiritual', 'Heritage'],
    bestMonths: [10, 11, 12, 2, 3],
    avoidMonths: [7, 8],
    climate: 'moderate',
    budget: 'budget',
    scores: { spiritual: 95, heritage: 82, family: 80, culture: 80, couple: 75 },
    agoda: 'haridwar-in'
  },
  'pushkar': {
    id: 'pushkar',
    name: 'Pushkar',
    state: 'Rajasthan',
    country: 'India',
    type: 'spiritual',
    categories: ['Spiritual', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    scores: { spiritual: 90, culture: 85, couple: 78, family: 72, adventure: 60 },
    agoda: 'pushkar-in'
  },
  'amritsar': {
    id: 'amritsar',
    name: 'Amritsar',
    state: 'Punjab',
    country: 'India',
    type: 'spiritual',
    categories: ['Spiritual', 'Heritage', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'extreme',
    budget: 'budget',
    scores: { spiritual: 92, heritage: 88, culture: 88, family: 80, couple: 75 },
    agoda: 'amritsar-in'
  },

  /* =====================
     ADVENTURE DESTINATIONS
  ===================== */
  'leh': {
    id: 'leh',
    name: 'Leh (Ladakh)',
    state: 'Ladakh',
    country: 'India',
    type: 'adventure',
    categories: ['Adventure', 'Mountain', 'Nature'],
    bestMonths: [6, 7, 8, 9],
    avoidMonths: [11, 12, 1, 2],
    climate: 'cold_desert',
    budget: 'premium',
    scores: { adventure: 98, nature: 92, couple: 85, family: 70, relaxation: 60 },
    agoda: 'leh-in'
  },
  'srinagar': {
    id: 'srinagar',
    name: 'Srinagar',
    state: 'Jammu & Kashmir',
    country: 'India',
    type: 'hill',
    categories: ['Nature', 'Romantic', 'Adventure'],
    bestMonths: [4, 5, 6, 9],
    avoidMonths: [12, 1, 2],
    climate: 'cold',
    budget: 'moderate',
    scores: { nature: 92, romance: 90, adventure: 75, couple: 92, family: 78 },
    agoda: 'srinagar-in'
  },
  'gulmarg': {
    id: 'gulmarg',
    name: 'Gulmarg',
    state: 'Jammu & Kashmir',
    country: 'India',
    type: 'adventure',
    categories: ['Snow', 'Adventure', 'Mountain'],
    bestMonths: [1, 2, 12],
    avoidMonths: [7, 8, 9],
    climate: 'cold',
    budget: 'premium',
    scores: { adventure: 95, nature: 88, family: 75, couple: 82, relaxation: 65 },
    agoda: 'gulmarg-in'
  },
  'wayanad': {
    id: 'wayanad',
    name: 'Wayanad',
    state: 'Kerala',
    country: 'India',
    type: 'hill',
    categories: ['Nature', 'Wildlife', 'Adventure'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'cool',
    budget: 'budget',
    scores: { nature: 90, adventure: 85, wildlife: 88, family: 80, couple: 80 },
    agoda: 'wayanad-in'
  },
  'ranthambore': {
    id: 'ranthambore',
    name: 'Ranthambore',
    state: 'Rajasthan',
    country: 'India',
    type: 'wildlife',
    categories: ['Wildlife', 'Adventure', 'Nature'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    avoidMonths: [6, 7],
    climate: 'hot',
    budget: 'premium',
    scores: { wildlife: 95, adventure: 88, nature: 85, family: 78, couple: 82 },
    agoda: 'ranthambore-in'
  },
  'kaziranga': {
    id: 'kaziranga',
    name: 'Kaziranga',
    state: 'Assam',
    country: 'India',
    type: 'wildlife',
    categories: ['Wildlife', 'Nature', 'Adventure'],
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [6, 7, 8],
    climate: 'humid',
    budget: 'moderate',
    scores: { wildlife: 98, nature: 92, adventure: 80, family: 80, couple: 75 },
    agoda: 'kaziranga-in'
  },
  'cherrapunji': {
    id: 'cherrapunji',
    name: 'Cherrapunji',
    state: 'Meghalaya',
    country: 'India',
    type: 'adventure',
    categories: ['Nature', 'Adventure'],
    bestMonths: [10, 11, 12, 3, 4],
    avoidMonths: [6, 7],
    climate: 'wet',
    budget: 'budget',
    scores: { nature: 92, adventure: 85, couple: 75, family: 72, relaxation: 65 },
    agoda: 'cherrapunji-in'
  },

  /* =====================
     CITY DESTINATIONS
  ===================== */
  'mumbai': {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    type: 'city',
    categories: ['City', 'Coastal'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7, 8],
    climate: 'humid',
    budget: 'premium',
    scores: { city: 95, nightlife: 90, culture: 85, family: 75, couple: 80 },
    agoda: 'mumbai-in'
  },
  'pune': {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    type: 'city',
    categories: ['City', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7, 8],
    climate: 'moderate',
    budget: 'moderate',
    scores: { city: 90, culture: 85, family: 80, nightlife: 80, couple: 78 },
    agoda: 'pune-in'
  }
};
