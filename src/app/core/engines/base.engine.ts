/**
 * BASE ENGINE (Abstract Class)
 * =============================
 * 
 * Foundation for all TripSaver engines.
 * Provides common structure and utilities.
 * 
 * Benefits:
 * - Consistent architecture across engines
 * - Shared utilities and helpers
 * - Easy to add new engines
 * - Type-safe engine operations
 */

import { Injectable } from '@angular/core';

/**
 * Base configuration for all engines
 */
export interface BaseEngineConfig {
  name: string;
  version: string;
  enabled: boolean;
}

/**
 * Base result interface that all engines extend
 */
export interface BaseEngineResult {
  engineName: string;
  timestamp: Date;
  success: boolean;
  metadata?: Record<string, any>;
}

/**
 * Abstract base class for all engines
 */
@Injectable()
export abstract class BaseEngine<TInput, TOutput extends BaseEngineResult> {
  
  protected abstract config: BaseEngineConfig;

  /**
   * Main processing method - must be implemented by each engine
   */
  abstract process(input: TInput): TOutput | Promise<TOutput>;

  /**
   * Validate input before processing
   */
  protected abstract validateInput(input: TInput): boolean;

  /**
   * Get engine configuration
   */
  getConfig(): BaseEngineConfig {
    return this.config;
  }

  /**
   * Check if engine is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Log engine activity (can be overridden)
   */
  protected log(message: string, data?: any): void {
    console.log(`[${this.config.name}] ${message}`, data || '');
  }

  /**
   * Log errors (can be overridden)
   */
  protected logError(message: string, error?: any): void {
    console.error(`[${this.config.name}] ERROR: ${message}`, error || '');
  }
}

/**
 * Engine Registry
 * ================
 * Central registry for all available engines
 */
export enum EngineType {
  RECOMMENDATION = 'recommendation',
  TRIP_READINESS = 'trip_readiness',
  DESTINATION = 'destination',
  DESTINATION_SCORING = 'destination_scoring',
  TRIP_READINESS_SCORING = 'trip_readiness_scoring'
}

export interface EngineMetadata {
  type: EngineType;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
}

/**
 * Engine registry configuration
 */
export const ENGINE_REGISTRY: Record<EngineType, EngineMetadata> = {
  [EngineType.RECOMMENDATION]: {
    type: EngineType.RECOMMENDATION,
    name: 'Recommendation Engine',
    description: 'Platform recommendation based on user preferences',
    version: '1.0.0',
    enabled: true
  },
  [EngineType.TRIP_READINESS]: {
    type: EngineType.TRIP_READINESS,
    name: 'Trip Readiness Engine',
    description: 'Trip readiness assessment and checklist generation',
    version: '1.0.0',
    enabled: true
  },
  [EngineType.DESTINATION]: {
    type: EngineType.DESTINATION,
    name: 'Destination Engine',
    description: 'Intelligent destination search and seasonal recommendations',
    version: '1.0.0',
    enabled: true
  },
  [EngineType.DESTINATION_SCORING]: {
    type: EngineType.DESTINATION_SCORING,
    name: 'Destination Scoring Engine',
    description: 'Intelligent scoring and ranking based on user preferences and timing',
    version: '1.0.0',
    enabled: true
  },
  [EngineType.TRIP_READINESS_SCORING]: {
    type: EngineType.TRIP_READINESS_SCORING,
    name: 'Trip Readiness Scoring Engine',
    description: 'Rule-based scoring for destination readiness based on weather, crowds, and timing',
    version: '1.0.0',
    enabled: true
  }
};

/**
 * Helper functions
 */

export function getEngineMetadata(type: EngineType): EngineMetadata | null {
  return ENGINE_REGISTRY[type] || null;
}

export function getActiveEngines(): EngineMetadata[] {
  return Object.values(ENGINE_REGISTRY).filter(e => e.enabled);
}

export function isEngineEnabled(type: EngineType): boolean {
  return ENGINE_REGISTRY[type]?.enabled || false;
}
