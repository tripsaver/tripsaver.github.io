/**
 * TRIP READINESS ENGINE
 * ======================
 * 
 * Assesses trip readiness and generates personalized checklists.
 * Helps users prepare for their trips with actionable items.
 * 
 * Features:
 * - Trip type assessment (domestic/international)
 * - Document checklist (passport, visa, etc.)
 * - Packing suggestions based on destination
 * - Budget preparation recommendations
 * - Timeline-based reminders
 * - Travel insurance recommendations
 */

import { Injectable } from '@angular/core';
import { BaseEngine, BaseEngineConfig, BaseEngineResult } from '../base.engine';

/**
 * Input for Trip Readiness Engine
 */
export interface TripReadinessInput {
  destination: string;
  destinationCountry: string;
  departureDate: Date;
  returnDate: Date;
  travelType: 'domestic' | 'international';
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  tripPurpose: 'leisure' | 'business' | 'family' | 'honeymoon' | 'adventure';
  budgetRange?: 'budget' | 'mid' | 'luxury';
}

/**
 * Checklist item categories
 */
export enum ChecklistCategory {
  DOCUMENTS = 'documents',
  BOOKING = 'booking',
  PACKING = 'packing',
  HEALTH = 'health',
  FINANCE = 'finance',
  PREPARATION = 'preparation'
}

/**
 * Priority levels for checklist items
 */
export enum Priority {
  CRITICAL = 'critical',    // Must-have (e.g., passport)
  HIGH = 'high',           // Important (e.g., visa)
  MEDIUM = 'medium',       // Recommended (e.g., travel adapter)
  LOW = 'low'              // Optional (e.g., guidebook)
}

/**
 * Individual checklist item
 */
export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  priority: Priority;
  daysBeforeDeparture: number; // When to complete this
  completed: boolean;
  tips?: string[];
  links?: {
    text: string;
    url: string;
  }[];
}

/**
 * Trip readiness score breakdown
 */
export interface ReadinessScore {
  overall: number;           // 0-100
  documents: number;         // 0-100
  booking: number;          // 0-100
  packing: number;          // 0-100
  health: number;           // 0-100
  finance: number;          // 0-100
  preparation: number;      // 0-100
}

/**
 * Timeline milestone
 */
export interface TimelineMilestone {
  daysBeforeDeparture: number;
  title: string;
  description: string;
  items: string[]; // Checklist item IDs
}

/**
 * Trip Readiness Result
 */
export interface TripReadinessResult extends BaseEngineResult {
  tripId: string;
  readinessScore: ReadinessScore;
  checklist: ChecklistItem[];
  timeline: TimelineMilestone[];
  criticalAlerts: string[];
  recommendations: string[];
  estimatedCompletionTime: number; // minutes to complete all items
}

/**
 * Trip Readiness Engine Implementation
 */
@Injectable({
  providedIn: 'root'
})
export class TripReadinessEngine extends BaseEngine<TripReadinessInput, TripReadinessResult> {
  
  protected config: BaseEngineConfig = {
    name: 'Trip Readiness Engine',
    version: '1.0.0',
    enabled: true
  };

  /**
   * Process trip readiness assessment
   */
  process(input: TripReadinessInput): TripReadinessResult {
    this.log('Processing trip readiness assessment', { destination: input.destination });

    // Validate input
    if (!this.validateInput(input)) {
      return this.createErrorResult(input);
    }

    // Calculate days until departure
    const daysUntilDeparture = this.calculateDaysUntilDeparture(input.departureDate);

    // Generate checklist
    const checklist = this.generateChecklist(input, daysUntilDeparture);

    // Calculate readiness score
    const readinessScore = this.calculateReadinessScore(checklist);

    // Generate timeline
    const timeline = this.generateTimeline(checklist, daysUntilDeparture);

    // Identify critical alerts
    const criticalAlerts = this.identifyCriticalAlerts(input, checklist, daysUntilDeparture);

    // Generate recommendations
    const recommendations = this.generateRecommendations(input, checklist);

    // Estimate completion time
    const estimatedCompletionTime = this.estimateCompletionTime(checklist);

    return {
      engineName: this.config.name,
      timestamp: new Date(),
      success: true,
      tripId: this.generateTripId(input),
      readinessScore,
      checklist,
      timeline,
      criticalAlerts,
      recommendations,
      estimatedCompletionTime
    };
  }

  /**
   * Validate input
   */
  protected validateInput(input: TripReadinessInput): boolean {
    if (!input.destination || !input.destinationCountry) {
      this.logError('Missing destination information');
      return false;
    }

    if (!input.departureDate || !input.returnDate) {
      this.logError('Missing travel dates');
      return false;
    }

    if (input.departureDate >= input.returnDate) {
      this.logError('Invalid date range');
      return false;
    }

    return true;
  }

  /**
   * Generate unique trip ID
   */
  private generateTripId(input: TripReadinessInput): string {
    const date = input.departureDate.toISOString().split('T')[0];
    const dest = input.destination.replace(/\s+/g, '-').toLowerCase();
    return `trip-${dest}-${date}-${Date.now()}`;
  }

  /**
   * Calculate days until departure
   */
  private calculateDaysUntilDeparture(departureDate: Date): number {
    const today = new Date();
    const diff = departureDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate comprehensive checklist
   */
  private generateChecklist(input: TripReadinessInput, daysUntilDeparture: number): ChecklistItem[] {
    const checklist: ChecklistItem[] = [];

    // Documents checklist
    checklist.push(...this.generateDocumentsChecklist(input));

    // Booking checklist
    checklist.push(...this.generateBookingChecklist(input));

    // Packing checklist
    checklist.push(...this.generatePackingChecklist(input));

    // Health checklist
    checklist.push(...this.generateHealthChecklist(input));

    // Finance checklist
    checklist.push(...this.generateFinanceChecklist(input));

    // Preparation checklist
    checklist.push(...this.generatePreparationChecklist(input));

    return checklist;
  }

  /**
   * Generate documents checklist
   */
  private generateDocumentsChecklist(input: TripReadinessInput): ChecklistItem[] {
    const items: ChecklistItem[] = [];

    if (input.travelType === 'international') {
      items.push({
        id: 'doc-passport',
        category: ChecklistCategory.DOCUMENTS,
        title: 'Valid Passport',
        description: 'Ensure passport is valid for at least 6 months beyond return date',
        priority: Priority.CRITICAL,
        daysBeforeDeparture: 60,
        completed: false,
        tips: [
          'Check expiry date (must be valid 6+ months after return)',
          'Ensure passport has blank pages for stamps',
          'Make photocopies and digital scans'
        ]
      });

      items.push({
        id: 'doc-visa',
        category: ChecklistCategory.DOCUMENTS,
        title: 'Visa Requirements',
        description: `Check visa requirements for ${input.destinationCountry}`,
        priority: Priority.CRITICAL,
        daysBeforeDeparture: 45,
        completed: false,
        tips: [
          'Check if visa-on-arrival is available',
          'Apply for e-visa if available',
          'Allow 2-4 weeks for visa processing'
        ],
        links: [
          { text: 'Check Visa Requirements', url: 'https://www.iatatravelcentre.com/passport-visa-health-travel-document-requirements.htm' }
        ]
      });
    } else {
      items.push({
        id: 'doc-id',
        category: ChecklistCategory.DOCUMENTS,
        title: 'Valid ID Proof',
        description: 'Carry valid government-issued photo ID (Aadhar, DL, PAN)',
        priority: Priority.CRITICAL,
        daysBeforeDeparture: 7,
        completed: false
      });
    }

    items.push({
      id: 'doc-booking-confirmations',
      category: ChecklistCategory.DOCUMENTS,
      title: 'Booking Confirmations',
      description: 'Print/download all booking confirmations (flight, hotel, activities)',
      priority: Priority.HIGH,
      daysBeforeDeparture: 3,
      completed: false
    });

    return items;
  }

  /**
   * Generate booking checklist
   */
  private generateBookingChecklist(input: TripReadinessInput): ChecklistItem[] {
    const items: ChecklistItem[] = [];

    items.push({
      id: 'book-flights',
      category: ChecklistCategory.BOOKING,
      title: 'Book Flights',
      description: 'Confirm round-trip flight bookings',
      priority: Priority.CRITICAL,
      daysBeforeDeparture: 30,
      completed: false,
      tips: [
        'Book 6-8 weeks in advance for best prices',
        'Check baggage allowance',
        'Consider seat selection'
      ]
    });

    items.push({
      id: 'book-accommodation',
      category: ChecklistCategory.BOOKING,
      title: 'Book Accommodation',
      description: 'Reserve hotels/stays for entire trip duration',
      priority: Priority.CRITICAL,
      daysBeforeDeparture: 21,
      completed: false,
      tips: [
        'Check cancellation policy',
        'Read recent reviews',
        'Verify location and amenities'
      ]
    });

    if (input.tripPurpose === 'adventure') {
      items.push({
        id: 'book-activities',
        category: ChecklistCategory.BOOKING,
        title: 'Book Activities',
        description: 'Pre-book tours, activities, and experiences',
        priority: Priority.MEDIUM,
        daysBeforeDeparture: 14,
        completed: false
      });
    }

    return items;
  }

  /**
   * Generate packing checklist
   */
  private generatePackingChecklist(input: TripReadinessInput): ChecklistItem[] {
    const items: ChecklistItem[] = [];

    items.push({
      id: 'pack-essentials',
      category: ChecklistCategory.PACKING,
      title: 'Pack Essentials',
      description: 'Clothes, toiletries, medications, chargers',
      priority: Priority.HIGH,
      daysBeforeDeparture: 2,
      completed: false,
      tips: [
        'Check weather forecast',
        'Pack versatile clothing',
        'Use packing cubes for organization'
      ]
    });

    if (input.travelType === 'international') {
      items.push({
        id: 'pack-adapter',
        category: ChecklistCategory.PACKING,
        title: 'Travel Adapter',
        description: `Get universal travel adapter for ${input.destinationCountry}`,
        priority: Priority.MEDIUM,
        daysBeforeDeparture: 5,
        completed: false
      });
    }

    return items;
  }

  /**
   * Generate health checklist
   */
  private generateHealthChecklist(input: TripReadinessInput): ChecklistItem[] {
    const items: ChecklistItem[] = [];

    if (input.travelType === 'international') {
      items.push({
        id: 'health-insurance',
        category: ChecklistCategory.HEALTH,
        title: 'Travel Insurance',
        description: 'Purchase comprehensive travel insurance',
        priority: Priority.HIGH,
        daysBeforeDeparture: 14,
        completed: false,
        tips: [
          'Cover medical emergencies',
          'Include trip cancellation coverage',
          'Check COVID-19 coverage'
        ]
      });

      items.push({
        id: 'health-vaccinations',
        category: ChecklistCategory.HEALTH,
        title: 'Vaccinations',
        description: `Check required vaccinations for ${input.destinationCountry}`,
        priority: Priority.HIGH,
        daysBeforeDeparture: 30,
        completed: false,
        links: [
          { text: 'WHO Travel Health', url: 'https://www.who.int/travel-advice' }
        ]
      });
    }

    items.push({
      id: 'health-medications',
      category: ChecklistCategory.HEALTH,
      title: 'Medications',
      description: 'Pack prescription medicines with doctor\'s note',
      priority: Priority.HIGH,
      daysBeforeDeparture: 3,
      completed: false
    });

    return items;
  }

  /**
   * Generate finance checklist
   */
  private generateFinanceChecklist(input: TripReadinessInput): ChecklistItem[] {
    const items: ChecklistItem[] = [];

    if (input.travelType === 'international') {
      items.push({
        id: 'finance-currency',
        category: ChecklistCategory.FINANCE,
        title: 'Exchange Currency',
        description: 'Get local currency or forex card',
        priority: Priority.HIGH,
        daysBeforeDeparture: 7,
        completed: false,
        tips: [
          'Use forex card for better rates',
          'Carry some cash for emergencies',
          'Inform bank about international travel'
        ]
      });
    }

    items.push({
      id: 'finance-cards',
      category: ChecklistCategory.FINANCE,
      title: 'Notify Bank',
      description: 'Inform bank/credit card company about travel dates',
      priority: Priority.MEDIUM,
      daysBeforeDeparture: 5,
      completed: false
    });

    return items;
  }

  /**
   * Generate preparation checklist
   */
  private generatePreparationChecklist(input: TripReadinessInput): ChecklistItem[] {
    const items: ChecklistItem[] = [];

    items.push({
      id: 'prep-itinerary',
      category: ChecklistCategory.PREPARATION,
      title: 'Create Itinerary',
      description: 'Plan daily activities and must-visit places',
      priority: Priority.MEDIUM,
      daysBeforeDeparture: 10,
      completed: false
    });

    items.push({
      id: 'prep-emergency-contacts',
      category: ChecklistCategory.PREPARATION,
      title: 'Emergency Contacts',
      description: 'Save local emergency numbers and embassy contact',
      priority: Priority.HIGH,
      daysBeforeDeparture: 3,
      completed: false
    });

    items.push({
      id: 'prep-home-setup',
      category: ChecklistCategory.PREPARATION,
      title: 'Home Arrangements',
      description: 'Arrange mail hold, pet care, plant watering',
      priority: Priority.LOW,
      daysBeforeDeparture: 2,
      completed: false
    });

    return items;
  }

  /**
   * Calculate readiness score
   */
  private calculateReadinessScore(checklist: ChecklistItem[]): ReadinessScore {
    const calculateCategoryScore = (category: ChecklistCategory): number => {
      const items = checklist.filter(item => item.category === category);
      if (items.length === 0) return 100;

      const completed = items.filter(item => item.completed).length;
      return Math.round((completed / items.length) * 100);
    };

    const categoryScores = {
      documents: calculateCategoryScore(ChecklistCategory.DOCUMENTS),
      booking: calculateCategoryScore(ChecklistCategory.BOOKING),
      packing: calculateCategoryScore(ChecklistCategory.PACKING),
      health: calculateCategoryScore(ChecklistCategory.HEALTH),
      finance: calculateCategoryScore(ChecklistCategory.FINANCE),
      preparation: calculateCategoryScore(ChecklistCategory.PREPARATION)
    };

    // Overall score with weighted categories
    const overall = Math.round(
      (categoryScores.documents * 0.3) +
      (categoryScores.booking * 0.25) +
      (categoryScores.packing * 0.15) +
      (categoryScores.health * 0.15) +
      (categoryScores.finance * 0.10) +
      (categoryScores.preparation * 0.05)
    );

    return {
      overall,
      ...categoryScores
    };
  }

  /**
   * Generate timeline milestones
   */
  private generateTimeline(checklist: ChecklistItem[], daysUntilDeparture: number): TimelineMilestone[] {
    const milestones: TimelineMilestone[] = [];
    const milestonePoints = [60, 30, 14, 7, 3, 1];

    milestonePoints.forEach(days => {
      if (days <= daysUntilDeparture) {
        const items = checklist
          .filter(item => item.daysBeforeDeparture >= days)
          .map(item => item.id);

        if (items.length > 0) {
          milestones.push({
            daysBeforeDeparture: days,
            title: this.getMilestoneTitle(days),
            description: this.getMilestoneDescription(days),
            items
          });
        }
      }
    });

    return milestones;
  }

  /**
   * Get milestone title
   */
  private getMilestoneTitle(days: number): string {
    if (days >= 60) return '2 Months Before';
    if (days >= 30) return '1 Month Before';
    if (days >= 14) return '2 Weeks Before';
    if (days >= 7) return '1 Week Before';
    if (days >= 3) return '3 Days Before';
    return 'Day Before Departure';
  }

  /**
   * Get milestone description
   */
  private getMilestoneDescription(days: number): string {
    if (days >= 60) return 'Start planning and booking';
    if (days >= 30) return 'Confirm bookings and documents';
    if (days >= 14) return 'Finalize details and arrangements';
    if (days >= 7) return 'Last-minute bookings and preparations';
    if (days >= 3) return 'Pack and organize documents';
    return 'Final checks and departure preparation';
  }

  /**
   * Identify critical alerts
   */
  private identifyCriticalAlerts(
    input: TripReadinessInput,
    checklist: ChecklistItem[],
    daysUntilDeparture: number
  ): string[] {
    const alerts: string[] = [];

    // Check for incomplete critical items
    const criticalItems = checklist.filter(
      item => item.priority === Priority.CRITICAL && !item.completed
    );

    criticalItems.forEach(item => {
      if (item.daysBeforeDeparture > daysUntilDeparture) {
        alerts.push(`⚠️ URGENT: ${item.title} should have been completed ${item.daysBeforeDeparture - daysUntilDeparture} days ago!`);
      }
    });

    // Check passport validity for international trips
    if (input.travelType === 'international') {
      alerts.push('⚠️ Verify passport validity (must be valid 6+ months after return)');
    }

    // Check if departure is within 7 days
    if (daysUntilDeparture <= 7) {
      const incomplete = checklist.filter(item => !item.completed);
      if (incomplete.length > 5) {
        alerts.push(`⚠️ Only ${daysUntilDeparture} days left with ${incomplete.length} items incomplete!`);
      }
    }

    return alerts;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(input: TripReadinessInput, checklist: ChecklistItem[]): string[] {
    const recommendations: string[] = [];

    // Budget-based recommendations
    if (input.budgetRange === 'budget') {
      recommendations.push('💡 Book flights and hotels in advance for better rates');
      recommendations.push('💡 Consider hostels or budget accommodations');
    } else if (input.budgetRange === 'luxury') {
      recommendations.push('💡 Consider airport lounge access for comfort');
      recommendations.push('💡 Book premium experiences in advance');
    }

    // Travel type recommendations
    if (input.travelType === 'international') {
      recommendations.push('💡 Download offline maps and translation apps');
      recommendations.push('💡 Register with your embassy if traveling to high-risk areas');
    }

    // Trip purpose recommendations
    if (input.tripPurpose === 'adventure') {
      recommendations.push('💡 Purchase adventure sports insurance');
      recommendations.push('💡 Pack appropriate gear and clothing');
    } else if (input.tripPurpose === 'business') {
      recommendations.push('💡 Prepare business cards and meeting materials');
      recommendations.push('💡 Book hotels with business amenities');
    }

    return recommendations;
  }

  /**
   * Estimate completion time
   */
  private estimateCompletionTime(checklist: ChecklistItem[]): number {
    const incompleteItems = checklist.filter(item => !item.completed);
    
    // Estimate based on priority
    let totalMinutes = 0;
    incompleteItems.forEach(item => {
      switch (item.priority) {
        case Priority.CRITICAL:
          totalMinutes += 30; // 30 min per critical item
          break;
        case Priority.HIGH:
          totalMinutes += 20;
          break;
        case Priority.MEDIUM:
          totalMinutes += 15;
          break;
        case Priority.LOW:
          totalMinutes += 10;
          break;
      }
    });

    return totalMinutes;
  }

  /**
   * Create error result
   */
  private createErrorResult(input: TripReadinessInput): TripReadinessResult {
    return {
      engineName: this.config.name,
      timestamp: new Date(),
      success: false,
      tripId: 'error',
      readinessScore: {
        overall: 0,
        documents: 0,
        booking: 0,
        packing: 0,
        health: 0,
        finance: 0,
        preparation: 0
      },
      checklist: [],
      timeline: [],
      criticalAlerts: ['Failed to process trip readiness assessment. Please check input data.'],
      recommendations: [],
      estimatedCompletionTime: 0
    };
  }
}
