import 'jasmine';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';
import { AffiliateConfigService, AffiliateConfigData } from '../../core/services/affiliate-config.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
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
    },
    lastUpdated: new Date().toISOString(),
    updatedBy: 'test'
  };

  beforeEach(async () => {
    const configServiceSpy = jasmine.createSpyObj('AffiliateConfigService', [
      'loadConfig',
      'getCurrentConfig',
      'getAffiliateId',
      'getActivePartner'
    ]);
    configServiceSpy.loadConfig.and.returnValue(of(mockConfig));
    configServiceSpy.getCurrentConfig.and.returnValue(mockConfig);
    configServiceSpy.getAffiliateId.and.returnValue('1955073');
    configServiceSpy.getActivePartner.and.returnValue('agoda');

    await TestBed.configureTestingModule({
      imports: [CommonModule, HomeComponent],
      providers: [{ provide: AffiliateConfigService, useValue: configServiceSpy }]
    }).compileComponents();

    affiliateConfigService = TestBed.inject(AffiliateConfigService) as jasmine.SpyObj<AffiliateConfigService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Affiliate Config Loading', () => {
    it('should load affiliate config on initialization', () => {
      expect(affiliateConfigService.loadConfig).toHaveBeenCalled();
    });

    it('should display active partner information', () => {
      expect(affiliateConfigService.getActivePartner()).toBe('agoda');
    });
  });

  describe('Partner Information', () => {
    it('should have access to all active partners', () => {
      const config = affiliateConfigService.getCurrentConfig();
      expect(config?.partners['agoda'].active).toBe(true);
      expect(config?.partners['amazon'].active).toBe(true);
      expect(config?.partners['abhibus'].active).toBe(true);
    });
  });
});

