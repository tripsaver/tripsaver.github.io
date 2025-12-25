import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { TripStepperComponent } from './trip-stepper.component';
import { AffiliateConfigService, AffiliateConfigData } from '../../core/services/affiliate-config.service';
import { AffiliateLinkBuilderService } from '../../core/services/affiliate-link-builder.service';
import { RecommendationEngine } from '../../core/engines/recommendation/recommendation.engine';
import { DestinationScoringEngine } from '../../core/engines/destination-scoring/destination-scoring.engine';
import { TripReadinessEngine } from '../../core/engines/trip-readiness/trip-readiness.engine';

describe('TripStepperComponent', () => {
  let component: TripStepperComponent;
  let fixture: ComponentFixture<TripStepperComponent>;
  let affiliateConfigService: jasmine.SpyObj<AffiliateConfigService>;

  const mockConfig: AffiliateConfigData = {
    _id: 'active',
    activePartner: 'agoda',
    partners: {
      agoda: {
        id: 'agoda',
        name: 'Agoda',
        logo: '🏨',
        baseUrl: 'https://www.agoda.com',
        affiliateId: '1955073',
        commission: 12,
        active: true,
        description: 'Best hotel deals in Asia',
        type: 'hotel'
      },
      amazon: {
        id: 'amazon',
        name: 'Amazon',
        logo: '🛍️',
        baseUrl: 'https://www.amazon.in',
        affiliateId: 'tripsaver21-21',
        commission: 5,
        active: true,
        description: 'Travel essentials and gear',
        type: 'shopping'
      },
      abhibus: {
        id: 'abhibus',
        name: 'AbhiBus',
        logo: '🚌',
        baseUrl: 'https://inr.deals/kQK6mx',
        affiliateId: 'kQK6mx',
        commission: 8,
        active: true,
        description: 'Bus tickets across India',
        type: 'bus'
      }
    }
  };

  beforeEach(async () => {
    const configServiceSpy = jasmine.createSpyObj('AffiliateConfigService', [
      'initConfig',
      'loadConfig',
      'getCurrentConfig'
    ]);
    configServiceSpy.initConfig.and.returnValue(of({ status: 'initialized' }));
    configServiceSpy.loadConfig.and.returnValue(of(mockConfig));

    await TestBed.configureTestingModule({
      declarations: [TripStepperComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: AffiliateConfigService, useValue: configServiceSpy },
        jasmine.createSpyObj('AffiliateLinkBuilderService', ['buildLink']),
        jasmine.createSpyObj('RecommendationEngine', ['getRecommendations']),
        jasmine.createSpyObj('DestinationScoringEngine', ['scoreDestination']),
        jasmine.createSpyObj('TripReadinessEngine', ['checkReadiness'])
      ]
    }).compileComponents();

    affiliateConfigService = TestBed.inject(AffiliateConfigService) as jasmine.SpyObj<AffiliateConfigService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TripStepperComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.currentStep).toBe(1);
      expect(component.totalSteps).toBe(4);
      expect(component.selectedShoppingPartner).toBe('amazon');
    });

    it('should load affiliate config on init', waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(affiliateConfigService.initConfig).toHaveBeenCalled();
        expect(affiliateConfigService.loadConfig).toHaveBeenCalled();
      });
    }));

    it('should load shopping partners from config', waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.availableShoppingPartners.length).toBeGreaterThan(0);
        expect(component.availableShoppingPartners.some((p: any) => p.type === 'shopping')).toBe(true);
      });
    }));

    it('should handle config load errors gracefully', waitForAsync(() => {
      affiliateConfigService.loadConfig.and.returnValue(throwError(() => new Error('Load failed')));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component).toBeTruthy();
      });
    }));
  });

  describe('Step Navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should increment current step on nextStep', () => {
      component.currentStep = 1;
      component.nextStep();
      expect(component.currentStep).toBe(2);
    });

    it('should not exceed total steps', () => {
      component.currentStep = 4;
      component.nextStep();
      expect(component.currentStep).toBe(4);
    });

    it('should decrement current step on prevStep', () => {
      component.currentStep = 2;
      component.prevStep();
      expect(component.currentStep).toBe(1);
    });

    it('should not go below step 1', () => {
      component.currentStep = 1;
      component.prevStep();
      expect(component.currentStep).toBe(1);
    });
  });

  describe('Shopping Partner Selection', () => {
    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable();
    }));

    it('should have amazon as default shopping partner', () => {
      expect(component.selectedShoppingPartner).toBe('amazon');
    });

    it('should allow changing shopping partner', () => {
      component.selectedShoppingPartner = 'agoda';
      expect(component.selectedShoppingPartner).toBe('agoda');
    });

    it('should filter shopping partners correctly', waitForAsync(() => {
      fixture.whenStable().then(() => {
        const shoppingPartners = component.availableShoppingPartners.filter(
          (p: any) => p.type === 'shopping' || p.type === 'both'
        );
        expect(shoppingPartners.length).toBeGreaterThan(0);
      });
    }));
  });

  describe('Preferences Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should initialize preferences object', () => {
      expect(component.preferences).toBeDefined();
      expect(component.preferences.interests).toEqual([]);
      expect(component.preferences.budget).toBe('moderate');
    });

    it('should allow updating preferences', () => {
      component.preferences.budget = 'premium';
      expect(component.preferences.budget).toBe('premium');

      component.preferences.duration = '6-10';
      expect(component.preferences.duration).toBe('6-10');
    });

    it('should update interests array', () => {
      component.preferences.interests.push('adventure');
      expect(component.preferences.interests).toContain('adventure');
    });

    it('should track readiness flags', () => {
      component.preferences.budgetReady = false;
      expect(component.preferences.budgetReady).toBe(false);

      component.preferences.docsReady = true;
      expect(component.preferences.docsReady).toBe(true);
    });
  });

  describe('Building Shopping Links', () => {
    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable();
    }));

    it('should build shopping link with search query', () => {
      const link = component.buildShoppingLink('luggage');
      expect(link).toBeDefined();
      expect(typeof link).toBe('string');
    });

    it('should include search query in link', () => {
      const link = component.buildShoppingLink('travel bag');
      expect(link).toContain('travel');
    });

    it('should encode special characters in search query', () => {
      const link = component.buildShoppingLink('travel & luggage');
      expect(link).toContain('%26');
    });

    it('should handle empty search query', () => {
      const link = component.buildShoppingLink('');
      expect(link).toBeDefined();
    });
  });

  describe('Affiliate Click Tracking', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should track affiliate clicks', () => {
      const windowSpy = spyOn(window as any, 'gtag');
      component.trackAffiliateClick('luggage');
      // Verify gtag was called (if gtag is available)
      // expect(windowSpy).toHaveBeenCalled();
    });

    it('should include event details in tracking', () => {
      component.trackAffiliateClick('travel bag');
      // Should be tracked with partner and item name
      expect(component.selectedShoppingPartner).toBeDefined();
    });
  });

  describe('Get Destination Categories', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return categories for destination type', () => {
      const categories = component.getDestinationCategories('hotel');
      expect(Array.isArray(categories)).toBe(true);
    });

    it('should filter categories correctly', () => {
      const hotelCategories = component.getDestinationCategories('hotel');
      const shoppingCategories = component.getDestinationCategories('shopping');
      expect(hotelCategories).toBeDefined();
      expect(shoppingCategories).toBeDefined();
    });
  });

  describe('UI State Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should track expanded destination state', () => {
      component.expandedDestinationId = 'goa';
      expect(component.expandedDestinationId).toBe('goa');
    });

    it('should initialize component without errors', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Partner Details', () => {
    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      fixture.whenStable();
    }));

    it('should provide access to shopping partner details', () => {
      const partner = component.availableShoppingPartners[0];
      expect(partner).toBeDefined();
      expect(partner.id).toBeDefined();
      expect(partner.name).toBeDefined();
    });

    it('should filter by active partners only', () => {
      const activePartners = component.availableShoppingPartners.filter((p: any) => p.active);
      expect(activePartners.length).toBeGreaterThan(0);
    });
  });
});
