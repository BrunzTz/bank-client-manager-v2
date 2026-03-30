import { Component, ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MainLayout } from './main-layout';
import { AuthService } from '../../core/services/auth/auth.service';
import { MicroFrontendService } from '../../core/services/micro-frontend/micro-frontend.service';

@Component({ selector: 'mock-remote', template: '', standalone: true })
class MockRemoteComponent {
  setClientManagementAction = jest.fn();
}

describe('MainLayout', () => {
  let component: MainLayout;
  let fixture: ComponentFixture<MainLayout>;
  let router: Router;
  let authServiceMock: { logout: jest.Mock; isAuthenticated: jest.Mock };
  let mfServiceMock: { loadRemoteComponent: jest.Mock };

  beforeEach(async () => {
    authServiceMock = {
      logout: jest.fn(),
      isAuthenticated: jest.fn().mockReturnValue(true),
    };

    mfServiceMock = {
      loadRemoteComponent: jest.fn().mockResolvedValue({
        ClientList: MockRemoteComponent,
        ClientManagementPage: MockRemoteComponent,
      }),
    };

    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: MicroFrontendService, useValue: mfServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load query screen on init', () => {
    expect(mfServiceMock.loadRemoteComponent).toHaveBeenCalledWith(
      4201, 'mfe-clientes', './ClientList'
    );
    expect(component.activeScreen).toBe('query');
  });

  describe('logout', () => {
    it('should call authService.logout and navigate to /login', () => {
      const navigateSpy = jest.spyOn(router = TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      component.logout();
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('showQuery', () => {
    it('should be a no-op when already on query screen', async () => {
      component.activeScreen = 'query';
      mfServiceMock.loadRemoteComponent.mockClear();
      await component.showQuery();
      expect(mfServiceMock.loadRemoteComponent).not.toHaveBeenCalled();
    });

    it('should render query screen when on management', async () => {
      component.activeScreen = 'management';
      mfServiceMock.loadRemoteComponent.mockClear();
      await component.showQuery();
      await fixture.whenStable();
      expect(mfServiceMock.loadRemoteComponent).toHaveBeenCalledWith(4201, 'mfe-clientes', './ClientList');
      expect(component.activeScreen).toBe('query');
    });
  });

  describe('showManagement', () => {
    it('should render management screen when on query', async () => {
      component.activeScreen = 'query';
      mfServiceMock.loadRemoteComponent.mockClear();
      await component.showManagement();
      await fixture.whenStable();
      expect(mfServiceMock.loadRemoteComponent).toHaveBeenCalledWith(4202, 'mfe-gerenciamento', './ClientManagementPage');
      expect(component.activeScreen).toBe('management');
    });

    it('should be a no-op (apply pending) when already on management', async () => {
      component.activeScreen = 'management';
      mfServiceMock.loadRemoteComponent.mockClear();
      await component.showManagement();
      expect(mfServiceMock.loadRemoteComponent).not.toHaveBeenCalled();
    });
  });

  describe('client-management-action event', () => {
    it('should call showQuery when action is query', async () => {
      component.activeScreen = 'management';
      const showQuerySpy = jest.spyOn(component, 'showQuery').mockResolvedValue();
      window.dispatchEvent(new CustomEvent('client-management-action', { detail: { action: 'query' } }));
      expect(showQuerySpy).toHaveBeenCalled();
    });

    it('should open management when action is create', async () => {
      mfServiceMock.loadRemoteComponent.mockClear();
      component.activeScreen = 'query';
      window.dispatchEvent(new CustomEvent('client-management-action', { detail: { action: 'create' } }));
      await fixture.whenStable();
      expect(mfServiceMock.loadRemoteComponent).toHaveBeenCalledWith(4202, 'mfe-gerenciamento', './ClientManagementPage');
    });

    it('should do nothing when event has no detail', () => {
      const showQuerySpy = jest.spyOn(component, 'showQuery');
      window.dispatchEvent(new CustomEvent('client-management-action', { detail: null }));
      expect(showQuerySpy).not.toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove event listener and destroy component ref', () => {
      const removeSpy = jest.spyOn(window, 'removeEventListener');
      const mockRef = { destroy: jest.fn() } as unknown as ComponentRef<any>;
      (component as any).currentComponentRef = mockRef;
      component.ngOnDestroy();
      expect(removeSpy).toHaveBeenCalledWith('client-management-action', expect.any(Function));
      expect(mockRef.destroy).toHaveBeenCalled();
    });
  });
});
