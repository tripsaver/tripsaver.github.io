import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AffiliateService } from './affiliate.service';
import { AffiliateConfigService, AffiliateConfigData } from '../affiliate-config.service';

describe('AffiliateService', () => {
  let service: AffiliateService;
  let configService: AffiliateConfigService;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AffiliateService, AffiliateConfigService]
    });
    service = TestBed.inject(AffiliateService);
    configService = TestBed.inject(AffiliateConfigService);

    // Mock the config service to return our mock config
    spyOn(configService, 'getCurrentConfig').and.returnValue(mockConfig);
  });

  describe('buildAffiliateLink', () => {
    it('should build Agoda affiliate link correctly', () => {
      const link = service.buildAffiliateLink('agoda', 'taj-mahal-hotel');
      expect(link).toContain('https://www.agoda.com');
      expect(link).toContain('1955073');
      expect(link).toContain('taj-mahal-hotel');
    });

    it('should build Amazon affiliate link correctly', () => {
      const link = service.buildAffiliateLink('amazon', 'travel-bag');
      expect(link).toContain('https://www.amazon.in');
      expect(link).toContain('tripsaver21-21');
      expect(link).toContain('travel-bag');
    });

    it('should build AbhiBus affiliate link', () => {
      const link = service.buildAffiliateLink('abhibus', 'any-hotel');
      expect(link).toBe('https://inr.deals/kQK6mx');
    });

    it('should return empty string if config not loaded', () => {
      (configService.getCurrentConfig as jasmine.Spy).and.returnValue(null);
      const link = service.buildAffiliateLink('agoda', 'hotel');
      expect(link).toBe('');
    });

    it('should return empty string if partner not found', () => {
      const link = service.buildAffiliateLink('nonexistent', 'hotel');
      expect(link).toBe('');
    });

    it('should encode special characters in search queries', () => {
      const link = service.buildAffiliateLink('amazon', 'travel bag & luggage');
      expect(link).toContain(encodeURIComponent('travel bag & luggage'));
    });

    it('should handle multiple spaces in hotel IDs', () => {
      const link = service.buildAffiliateLink('agoda', 'taj mahal hotel goa');
      expect(link).toContain(encodeURIComponent('taj mahal hotel goa'));
    });
  });

  describe('getPrices', () => {
    it('should return promise with price entries', async () => {
      const prices = await service.getPrices('taj-mahal-hotel');
      expect(prices).toBeDefined();
      expect(Array.isArray(prices)).toBe(true);
    });

    it('should include provider names in prices', async () => {
      const prices = await service.getPrices('hotel-123');
      const providers = prices.map((p) => p.provider);
      expect(providers.length).toBeGreaterThan(0);
    });

    it('should include price and currency in entries', async () => {
      const prices = await service.getPrices('hotel-456');
      prices.forEach((entry) => {
        expect(entry.price).toBeGreaterThan(0);
        expect(entry.currency).toBe('INR');
      });
    });

    it('should include affiliate URLs', async () => {
      const prices = await service.getPrices('hotel-789');
      prices.forEach((entry) => {
        expect(entry.url).toBeDefined();
      });
    });
  });

  describe('getActivePartners', () => {
    it('should return array of active partners', () => {
      const partners = service.getActivePartners();
      expect(Array.isArray(partners)).toBe(true);
    });
  });

  describe('Link parameter formatting', () => {
    it('should format Agoda parameters correctly', () => {
      const link = service.buildAffiliateLink('agoda', 'test-hotel');
      expect(link).toMatch(/affid=1955073/);
      expect(link).toMatch(/hotel=test-hotel/);
    });

    it('should format Amazon parameters correctly', () => {
      const link = service.buildAffiliateLink('amazon', 'luggage');
      expect(link).toMatch(/k=luggage/);
      expect(link).toMatch(/tag=tripsaver21-21/);
    });

    it('should handle URL encoding properly', () => {
      const link = service.buildAffiliateLink('amazon', 'travel bag');
      expect(link).toContain('k=travel%20bag');
    });
  });

  describe('Commission rates', () => {
    it('should have correct commission rates in config', () => {
      expect(mockConfig.partners['agoda'].commission).toBe(12);
      expect(mockConfig.partners['amazon'].commission).toBe(5);
      expect(mockConfig.partners['abhibus'].commission).toBe(8);
    });
  });
});
