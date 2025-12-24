import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AffiliateConfigService, AffiliateConfigData, AffiliatePartner } from './affiliate-config.service';

describe('AffiliateConfigService', () => {
  let service: AffiliateConfigService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://tripsaver-github-io.onrender.com/api/affiliate-config';

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
    },
    lastUpdated: new Date().toISOString(),
    updatedBy: 'test'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AffiliateConfigService]
    });
    service = TestBed.inject(AffiliateConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('loadConfig', () => {
    it('should load affiliate config from MongoDB', (done) => {
      service.loadConfig().subscribe((config) => {
        expect(config).toEqual(mockConfig);
        expect(config.partners).toBeDefined();
        expect(config.partners['agoda']).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockConfig);
    });

    it('should update configSubject when config is loaded', (done) => {
      service.loadConfig().subscribe(() => {
        expect(service.getCurrentConfig()).toEqual(mockConfig);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockConfig);
    });

    it('should handle errors gracefully', (done) => {
      service.loadConfig().subscribe(
        () => {
          fail('should have failed');
        },
        (error) => {
          expect(error.status).toBe(500);
          done();
        }
      );

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('initConfig', () => {
    it('should initialize config if not exists', (done) => {
      service.initConfig().subscribe((result) => {
        expect(result.status).toBe('initialized');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/init`);
      expect(req.request.method).toBe('GET');
      req.flush({ status: 'initialized', message: 'Config initialized with defaults', config: mockConfig });
    });

    it('should return existing config if already initialized', (done) => {
      service.initConfig().subscribe((result) => {
        expect(result.status).toBe('already_exists');
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/init`);
      req.flush({ status: 'already_exists', message: 'Config already initialized', config: mockConfig });
    });
  });

  describe('getCurrentConfig', () => {
    it('should return current config synchronously', (done) => {
      service.loadConfig().subscribe(() => {
        const config = service.getCurrentConfig();
        expect(config).toEqual(mockConfig);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockConfig);
    });

    it('should return null if config not loaded', () => {
      const config = service.getCurrentConfig();
      expect(config).toBeNull();
    });
  });

  describe('waitForConfig', () => {
    it('should wait for config to load and return it', async () => {
      const promise = service.waitForConfig();
      
      // Simulate config load
      setTimeout(() => {
        const req = httpMock.expectOne(apiUrl);
        req.flush(mockConfig);
      }, 10);

      const config = await promise;
      expect(config).toEqual(mockConfig);
    });

    it('should return immediately if config already loaded', async () => {
      // First load config
      service.loadConfig().subscribe();
      const req = httpMock.expectOne(apiUrl);
      req.flush(mockConfig);

      // Now waitForConfig should return immediately
      const config = await service.waitForConfig();
      expect(config).toEqual(mockConfig);
    });
  });

  describe('getActivePartner', () => {
    it('should return active partner from config', (done) => {
      service.loadConfig().subscribe(() => {
        const activePartner = service.getActivePartner();
        expect(activePartner).toBe('agoda');
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockConfig);
    });

    it('should return null if config not loaded', () => {
      const activePartner = service.getActivePartner();
      expect(activePartner).toBeNull();
    });
  });

  describe('getAffiliateId', () => {
    it('should return affiliate ID for specific partner', (done) => {
      service.loadConfig().subscribe(() => {
        const agodaId = service.getAffiliateId('agoda');
        expect(agodaId).toBe('1955073');

        const amazonId = service.getAffiliateId('amazon');
        expect(amazonId).toBe('tripsaver21-21');

        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockConfig);
    });

    it('should return null if partner not found', (done) => {
      service.loadConfig().subscribe(() => {
        const nonexistentId = service.getAffiliateId('nonexistent');
        expect(nonexistentId).toBeNull();
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockConfig);
    });
  });

  describe('updateConfig', () => {
    it('should update config and reload', (done) => {
      const updatedConfig = { ...mockConfig, activePartner: 'amazon' };

      service.updateConfig({ activePartner: 'amazon' }).subscribe(() => {
        expect(service.getActivePartner()).toBe('amazon');
        done();
      });

      const postReq = httpMock.expectOne(apiUrl);
      expect(postReq.request.method).toBe('POST');
      postReq.flush({ status: 'updated', config: updatedConfig });

      const getReq = httpMock.expectOne(apiUrl);
      getReq.flush(updatedConfig);
    });
  });

  describe('updateAffiliateId', () => {
    it('should update specific affiliate ID', (done) => {
      const updatedConfig = {
        ...mockConfig,
        partners: {
          ...mockConfig.partners,
          agoda: {
            ...mockConfig.partners.agoda,
            affiliateId: 'NEW_AGODA_ID'
          }
        }
      };

      service.updateAffiliateId('agoda', 'NEW_AGODA_ID').subscribe(() => {
        expect(service.getAffiliateId('agoda')).toBe('NEW_AGODA_ID');
        done();
      });

      const patchReq = httpMock.expectOne(`${apiUrl}/agoda`);
      expect(patchReq.request.method).toBe('PATCH');
      patchReq.flush({ status: 'updated', config: updatedConfig });

      const getReq = httpMock.expectOne(apiUrl);
      getReq.flush(updatedConfig);
    });
  });

  describe('setActivePartner', () => {
    it('should set active partner', (done) => {
      const updatedConfig = { ...mockConfig, activePartner: 'amazon' };

      service.setActivePartner('amazon').subscribe(() => {
        expect(service.getActivePartner()).toBe('amazon');
        done();
      });

      const postReq = httpMock.expectOne(apiUrl);
      postReq.flush({ status: 'updated', config: updatedConfig });

      const getReq = httpMock.expectOne(apiUrl);
      getReq.flush(updatedConfig);
    });
  });

  describe('config$ observable', () => {
    it('should emit config through config$ observable', (done) => {
      service.config$.subscribe((config) => {
        if (config) {
          expect(config).toEqual(mockConfig);
          done();
        }
      });

      service.loadConfig().subscribe();
      const req = httpMock.expectOne(apiUrl);
      req.flush(mockConfig);
    });
  });

  describe('Partner filtering', () => {
    it('should correctly identify active partners', (done) => {
      service.loadConfig().subscribe(() => {
        const config = service.getCurrentConfig();
        const activePartners = Object.values(config!.partners).filter((p) => p.active);
        expect(activePartners.length).toBe(3);
        expect(activePartners.map((p) => p.id)).toContain('agoda');
        expect(activePartners.map((p) => p.id)).toContain('amazon');
        expect(activePartners.map((p) => p.id)).toContain('abhibus');
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockConfig);
    });

    it('should filter partners by type', (done) => {
      service.loadConfig().subscribe(() => {
        const config = service.getCurrentConfig();
        const shoppingPartners = Object.values(config!.partners).filter(
          (p) => p.type === 'shopping' || p.type === 'both'
        );
        expect(shoppingPartners.length).toBeGreaterThan(0);
        expect(shoppingPartners.map((p) => p.id)).toContain('amazon');
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(mockConfig);
    });
  });
});
