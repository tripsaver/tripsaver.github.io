/**
 * DESTINATIONS DATA
 * ==================
 * 
 * Static data for Indian destinations
 */

export type DestinationCategory = 
  | 'Beach' | 'Mountain' | 'Hill' | 'Heritage' | 'Spiritual'
  | 'Adventure' | 'Nature' | 'Wildlife' | 'City' | 'Coastal'
  | 'Backwaters' | 'Party' | 'Romantic' | 'Snow' | 'Ski'
  | 'Colonial' | 'Island' | 'Culture' | 'Lake';

export type ClimateType = 
  | 'tropical' | 'cold' | 'hot' | 'moderate' | 'humid'
  | 'cool' | 'extreme' | 'cold_desert' | 'wet';

export type BudgetType = 'budget' | 'moderate' | 'premium';

export interface Destination {
  state: string;
  categories: DestinationCategory[];
  bestMonths: number[];
  avoidMonths: number[];
  climate: ClimateType;
  budget: BudgetType;
  agoda: string;
}

export const DESTINATIONS_DATA: Record<string, Destination> = {
  'goa': {
    state: 'Goa',
    categories: ['Beach', 'Party'],
    bestMonths: [11, 12, 1, 2],
    avoidMonths: [6, 7, 8],
    climate: 'tropical',
    budget: 'moderate',
    agoda: 'goa-in'
  },
  'mumbai': {
    state: 'Maharashtra',
    categories: ['City', 'Coastal'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7, 8],
    climate: 'humid',
    budget: 'premium',
    agoda: 'mumbai-in'
  },
  'pune': {
    state: 'Maharashtra',
    categories: ['City', 'Hill'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7, 8],
    climate: 'moderate',
    budget: 'moderate',
    agoda: 'pune-in'
  },
  'manali': {
    state: 'Himachal Pradesh',
    categories: ['Mountain', 'Snow'],
    bestMonths: [3, 4, 5, 10],
    avoidMonths: [7, 8],
    climate: 'cold',
    budget: 'budget',
    agoda: 'manali-in'
  },
  'shimla': {
    state: 'Himachal Pradesh',
    categories: ['Hill', 'Colonial'],
    bestMonths: [3, 4, 5, 10],
    avoidMonths: [7, 8],
    climate: 'cold',
    budget: 'budget',
    agoda: 'shimla-in'
  },
  'jaipur': {
    state: 'Rajasthan',
    categories: ['Heritage'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    agoda: 'jaipur-in'
  },
  'udaipur': {
    state: 'Rajasthan',
    categories: ['Romantic', 'Heritage'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'moderate',
    agoda: 'udaipur-in'
  },
  'jodhpur': {
    state: 'Rajasthan',
    categories: ['Heritage'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    agoda: 'jodhpur-in'
  },
  'rishikesh': {
    state: 'Uttarakhand',
    categories: ['Spiritual', 'Adventure'],
    bestMonths: [2, 3, 4, 9, 10],
    avoidMonths: [7, 8],
    climate: 'moderate',
    budget: 'budget',
    agoda: 'rishikesh-in'
  },
  'delhi': {
    state: 'Delhi',
    categories: ['City', 'Culture', 'Heritage'],
    bestMonths: [10, 11, 12, 2, 3],
    avoidMonths: [5, 6],
    climate: 'extreme',
    budget: 'budget',
    agoda: 'new-delhi-in'
  },
  'agra': {
    state: 'Uttar Pradesh',
    categories: ['Heritage'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    agoda: 'agra-in'
  },
  'varanasi': {
    state: 'Uttar Pradesh',
    categories: ['Spiritual', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    agoda: 'varanasi-in'
  },
  'leh': {
    state: 'Ladakh',
    categories: ['Adventure', 'Mountain'],
    bestMonths: [6, 7, 8, 9],
    avoidMonths: [11, 12, 1, 2],
    climate: 'cold_desert',
    budget: 'premium',
    agoda: 'leh-in'
  },
  'srinagar': {
    state: 'Jammu & Kashmir',
    categories: ['Nature', 'Romantic'],
    bestMonths: [4, 5, 6, 9],
    avoidMonths: [12, 1, 2],
    climate: 'cold',
    budget: 'moderate',
    agoda: 'srinagar-in'
  },
  'gulmarg': {
    state: 'Jammu & Kashmir',
    categories: ['Snow', 'Ski'],
    bestMonths: [1, 2, 12],
    avoidMonths: [7, 8],
    climate: 'cold',
    budget: 'premium',
    agoda: 'gulmarg-in'
  },
  'kochi': {
    state: 'Kerala',
    categories: ['Backwaters', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'tropical',
    budget: 'moderate',
    agoda: 'kochi-in'
  },
  'munnar': {
    state: 'Kerala',
    categories: ['Hill', 'Nature'],
    bestMonths: [9, 10, 11, 12, 1],
    avoidMonths: [6, 7],
    climate: 'cool',
    budget: 'moderate',
    agoda: 'munnar-in'
  },
  'alleppey': {
    state: 'Kerala',
    categories: ['Backwaters'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'tropical',
    budget: 'moderate',
    agoda: 'alleppey-in'
  },
  'ooty': {
    state: 'Tamil Nadu',
    categories: ['Hill'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'cool',
    budget: 'moderate',
    agoda: 'ooty-in'
  },
  'pondicherry': {
    state: 'Puducherry',
    categories: ['Beach', 'Culture', 'Colonial'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [10],
    climate: 'humid',
    budget: 'moderate',
    agoda: 'pondicherry-in'
  },
  'hampi': {
    state: 'Karnataka',
    categories: ['Heritage'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    agoda: 'hampi-in'
  },
  'coorg': {
    state: 'Karnataka',
    categories: ['Hill', 'Nature'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'cool',
    budget: 'moderate',
    agoda: 'coorg-in'
  },
  'gokarna': {
    state: 'Karnataka',
    categories: ['Beach'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'tropical',
    budget: 'budget',
    agoda: 'gokarna-in'
  },
  'darjeeling': {
    state: 'West Bengal',
    categories: ['Hill', 'Colonial'],
    bestMonths: [3, 4, 5, 10],
    avoidMonths: [7, 8],
    climate: 'cool',
    budget: 'moderate',
    agoda: 'darjeeling-in'
  },
  'gangtok': {
    state: 'Sikkim',
    categories: ['Hill', 'Nature'],
    bestMonths: [3, 4, 5, 10],
    avoidMonths: [7, 8],
    climate: 'cool',
    budget: 'moderate',
    agoda: 'gangtok-in'
  },
  'shillong': {
    state: 'Meghalaya',
    categories: ['Nature', 'Hill'],
    bestMonths: [10, 11, 12, 3, 4],
    avoidMonths: [6, 7],
    climate: 'cool',
    budget: 'budget',
    agoda: 'shillong-in'
  },
  'andaman': {
    state: 'Andaman & Nicobar',
    categories: ['Island', 'Beach'],
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [6, 7, 8],
    climate: 'tropical',
    budget: 'premium',
    agoda: 'andaman-in'
  },
  'amritsar': {
    state: 'Punjab',
    categories: ['Spiritual', 'Heritage'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'extreme',
    budget: 'budget',
    agoda: 'amritsar-in'
  },
  'varkala': {
    state: 'Kerala',
    categories: ['Beach', 'Spiritual'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'tropical',
    budget: 'budget',
    agoda: 'varkala-in'
  },
  'kodaikanal': {
    state: 'Tamil Nadu',
    categories: ['Hill'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'cool',
    budget: 'moderate',
    agoda: 'kodaikanal-in'
  },
  'mahabaleshwar': {
    state: 'Maharashtra',
    categories: ['Hill'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [7, 8],
    climate: 'cool',
    budget: 'moderate',
    agoda: 'mahabaleshwar-in'
  },
  'lonavala': {
    state: 'Maharashtra',
    categories: ['Hill'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [7, 8],
    climate: 'cool',
    budget: 'budget',
    agoda: 'lonavala-in'
  },
  'haridwar': {
    state: 'Uttarakhand',
    categories: ['Spiritual'],
    bestMonths: [10, 11, 12, 2, 3],
    avoidMonths: [7, 8],
    climate: 'moderate',
    budget: 'budget',
    agoda: 'haridwar-in'
  },
  'wayanad': {
    state: 'Kerala',
    categories: ['Nature', 'Wildlife'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'cool',
    budget: 'budget',
    agoda: 'wayanad-in'
  },
  'kaziranga': {
    state: 'Assam',
    categories: ['Wildlife', 'Nature'],
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [6, 7, 8],
    climate: 'humid',
    budget: 'moderate',
    agoda: 'kaziranga-in'
  },
  'mysore': {
    state: 'Karnataka',
    categories: ['Heritage', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [6, 7],
    climate: 'moderate',
    budget: 'budget',
    agoda: 'mysore-in'
  },
  'ranthambore': {
    state: 'Rajasthan',
    categories: ['Wildlife'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    avoidMonths: [6, 7],
    climate: 'hot',
    budget: 'premium',
    agoda: 'ranthambore-in'
  },
  'khajuraho': {
    state: 'Madhya Pradesh',
    categories: ['Heritage'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    agoda: 'khajuraho-in'
  },
  'pushkar': {
    state: 'Rajasthan',
    categories: ['Spiritual', 'Culture'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    agoda: 'pushkar-in'
  },
  'mount-abu': {
    state: 'Rajasthan',
    categories: ['Hill'],
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [5, 6],
    climate: 'cool',
    budget: 'moderate',
    agoda: 'mount-abu-in'
  },
  'cherrapunji': {
    state: 'Meghalaya',
    categories: ['Nature'],
    bestMonths: [10, 11, 12, 3, 4],
    avoidMonths: [6, 7],
    climate: 'wet',
    budget: 'budget',
    agoda: 'cherrapunji-in'
  },
  'madurai': {
    state: 'Tamil Nadu',
    categories: ['Heritage', 'Spiritual'],
    bestMonths: [10, 11, 12, 1, 2],
    avoidMonths: [5, 6],
    climate: 'hot',
    budget: 'budget',
    agoda: 'madurai-in'
  },
  'nainital': {
    state: 'Uttarakhand',
    categories: ['Hill', 'Lake'],
    bestMonths: [3, 4, 5, 10],
    avoidMonths: [7, 8],
    climate: 'cool',
    budget: 'moderate',
    agoda: 'nainital-in'
  },
  'mussoorie': {
    state: 'Uttarakhand',
    categories: ['Hill', 'Colonial'],
    bestMonths: [3, 4, 5, 10],
    avoidMonths: [7, 8],
    climate: 'cool',
    budget: 'moderate',
    agoda: 'mussoorie-in'
  }
};
