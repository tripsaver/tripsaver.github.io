import { Injectable } from '@angular/core';
import { Destination } from '../engines/destination/destinations.data';

/**
 * Service to generate hero images and fallback gradients for destinations
 * Maps destination names/states to appropriate visual assets
 */
@Injectable({
  providedIn: 'root'
})
export class DestinationHeroService {
  /**
   * High-contrast, recognisable landmark images from Unsplash
   * Landscape format, suitable for card headers
   */
  private heroImageMap: Record<string, string> = {
    // States (use state-representative landmarks)
    'Andaman & Nicobar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop', // Beach
    'Karnataka': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=400&fit=crop', // Hampi ruins
    'Kerala': 'https://images.unsplash.com/photo-1537225228614-b4e87ad64771?w=800&h=400&fit=crop', // Houseboat backwaters
    'Goa': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop', // Beach sunset
    'Rajasthan': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop', // Desert/Pink City
    'Himachal Pradesh': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop', // Mountains
    'Uttarakhand': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop', // Mountains
    'Uttar Pradesh': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=400&fit=crop', // Heritage
    'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ee0?w=800&h=400&fit=crop', // City monuments
    'Maharashtra': 'https://images.unsplash.com/photo-1570155436410-ce5e5c9bd600?w=800&h=400&fit=crop', // City/Gateway
    
    // Cities (more specific)
    'Bangalore': 'https://images.unsplash.com/photo-1570155436410-ce5e5c9bd600?w=800&h=400&fit=crop', // Modern city
    'Manali': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop', // Mountains
    'Jaipur': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop', // Pink City
    'Agra': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=400&fit=crop', // Heritage/Taj
    'Rishikesh': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop', // River/Yoga
    'Udaipur': 'https://images.unsplash.com/photo-1578616172058-cb4663fc4c0f?w=800&h=400&fit=crop', // Palace/Lake
    'Kochi': 'https://images.unsplash.com/photo-1537225228614-b4e87ad64771?w=800&h=400&fit=crop', // Backwaters
    'Mumbai': 'https://images.unsplash.com/photo-1570155436410-ce5e5c9bd600?w=800&h=400&fit=crop', // Gateway
    'Coorg': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop', // Coffee plantations/hills
    'Hampi': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=400&fit=crop', // Ruins
    'Gokarna': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop', // Beach
  };

  /**
   * Fallback gradient colors based on destination type
   */
  private typeGradientMap: Record<string, string> = {
    'beach': 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', // Cyan/Sky
    'hill': 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Green
    'mountain': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', // Purple
    'city': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
    'heritage': 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', // Pink
    'island': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', // Cyan
    'wildlife': 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)', // Lime
    'spiritual': 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', // Purple
    'adventure': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', // Orange
    'default': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' // Indigo
  };

  /**
   * Get hero image URL for destination
   * Falls back to gradient if image not available
   */
  getHeroImage(destination: Destination): string | null {
    if (!destination) return null;

    // Try by destination name first, then by state
    const nameKey = destination.name;
    const stateKey = destination.state;

    return this.heroImageMap[nameKey] || this.heroImageMap[stateKey] || null;
  }

  /**
   * Get fallback gradient for destination based on type
   */
  getFallbackGradient(destination: Destination): string {
    if (!destination) return this.typeGradientMap['default'];

    const type = destination.type?.toLowerCase() || 'default';
    return this.typeGradientMap[type] || this.typeGradientMap['default'];
  }

  /**
   * Get background style (image with overlay, or gradient)
   */
  getCardBackgroundStyle(destination: Destination): any {
    const heroImage = this.getHeroImage(destination);
    
    if (heroImage) {
      return {
        'background-image': `linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0.1)), url('${heroImage}')`,
        'background-size': 'cover',
        'background-position': 'center'
      };
    } else {
      return {
        'background': this.getFallbackGradient(destination)
      };
    }
  }

  /**
   * Get popular places for explore mode fallback
   */
  getPopularPlaces(destination: Destination): string[] {
    const placesMap: Record<string, string[]> = {
      'Andaman & Nicobar': ['🏝️ Radhanagar Beach', '🤿 Scuba Diving', '🌅 Neil Island', '⛵ Port Blair'],
      'Karnataka': ['🏛️ Hampi Ruins', '☕ Coorg Coffee', '🌄 Bangalore City', '🏖️ Gokarna Beach'],
      'Kerala': ['🏠 Houseboat Backwaters', '🌴 Kochi Spice Market', '⛱️ Alleppey Beach', '🥥 Coconut Plantations'],
      'Goa': ['🏖️ Baga Beach', '🕌 Old Goa Churches', '🌅 Sunset Cliffs', '🍽️ Beach Shacks'],
      'Rajasthan': ['🏰 Amber Fort', '🎨 Pink City Jaipur', '🏜️ Desert Safari', '🕌 Sacred Temples'],
      'Himachal Pradesh': ['⛷️ Solang Valley', '🥾 Manali Treks', '🏔️ Mountain Peaks', '🏘️ Old Towns'],
      'Uttarakhand': ['🏔️ Himalayan Views', '🧘 Yoga Capital', '🚣 River Rafting', '🌲 Forest Trails'],
      'Uttar Pradesh': ['🕌 Taj Mahal', '🏛️ Mughal Heritage', '🌊 Ganges Ghats', '🏞️ Wildlife'],
      'Delhi': ['🕌 Red Fort', '🏛️ India Gate', '🛕 Heritage Sites', '🏪 Street Markets'],
      'Maharashtra': ['🏛️ Gateway of India', '🎬 Bollywood', '🏖️ Coastal Gems', '🌃 City Life'],
    };

    const stateKey = destination.state;
    return placesMap[stateKey] || [
      '📍 Top Destinations',
      '🎯 Popular Activities', 
      '🏞️ Scenic Spots',
      '🍽️ Local Cuisine'
    ];
  }
}
