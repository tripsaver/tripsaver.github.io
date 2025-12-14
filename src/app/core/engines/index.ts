/**
 * ENGINES MODULE - Public API
 * ============================
 * 
 * Central export point for all engines.
 * Import from this file to access any engine.
 * 
 * Usage:
 * import { EngineFactory, RecommendationEngine, TripReadinessEngine } from '@core/engines';
 */

// TEMPORARILY DISABLED TO TEST BUILD
/*
// Base Engine
export * from './base.engine';

// Engine Factory
export * from './engine.factory';

// Individual Engines
export * from './recommendation/recommendation.engine';
export * from './trip-readiness/trip-readiness.engine';
export * from './destination/destination.engine';
export * from './destination/destinations.data';

// Scoring Engines (specific exports to avoid conflicts)
export { TripReadinessScoringEngine } from './trip-readiness/trip-readiness-scoring.engine';
export { DestinationScoringEngine } from './destination-scoring/destination-scoring.engine';
export type { ScoredDestination } from './destination-scoring/destination-scoring.engine';
*/

/**
 * ARCHITECTURE OVERVIEW
 * ======================
 * 
 * src/app/core/engines/
 * ├── base.engine.ts                    # Abstract base class
 * ├── engine.factory.ts                 # Centralized factory
 * ├── index.ts                          # Public API (this file)
 * ├── recommendation/
 * │   └── recommendation.engine.ts      # Platform recommendation
 * ├── trip-readiness/
 * │   └── trip-readiness.engine.ts      # Trip checklist & readiness
 * ├── destination/
 * │   ├── destination.engine.ts         # Destination data management
 * │   └── destinations.data.ts          # Destination dataset
 * └── destination-scoring/
 *     └── destination-scoring.engine.ts # Intelligent scoring & ranking
 * 
 * ADDING NEW ENGINE:
 * ==================
 * 
 * 1. Create new folder: src/app/core/engines/your-engine/
 * 2. Create engine file: your-engine.engine.ts
 * 3. Extend BaseEngine<TInput, TOutput>
 * 4. Implement process() and validateInput()
 * 5. Add to EngineType enum in base.engine.ts
 * 6. Add to ENGINE_REGISTRY in base.engine.ts
 * 7. Add to EngineFactory in engine.factory.ts
 * 8. Export from this index.ts
 * 9. Done! Engine ready to use across app
 * 
 * BENEFITS:
 * =========
 * 
 * ✅ Single source of truth (one import path)
 * ✅ Type-safe engine access
 * ✅ Consistent architecture
 * ✅ Easy to add new engines
 * ✅ Centralized enable/disable control
 * ✅ Dependency injection ready
 * ✅ Unit testable
 * ✅ Documentation in one place
 */
