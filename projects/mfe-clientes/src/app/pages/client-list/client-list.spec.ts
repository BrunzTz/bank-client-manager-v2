import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ClientList } from './client-list';
import { ClientService } from '../../core/services/client.service';
import { Client } from '../../core/models/client.model';

const mockClients: Client[] = [
  { id: '1', companyName: 'Acme Corp', tradeName: 'Acme', cnpj: '12345678000100', email: 'acme@test.com', phone: '11999999990', status: 'ACTIVE', createdAt: '2024-01-01' },
  { id: '2', companyName: 'Beta Ltd', tradeName: 'Beta', cnpj: '98765432000100', email: 'beta@test.com', phone: '11888888880', status: 'INACTIVE', createdAt: '2024-01-02' },
];

describe('ClientList', () => {
  let component: ClientList;
  let fixture: ComponentFixture<ClientList>;
  let clientServiceMock: { getClients: jest.Mock };

  beforeEach(async () => {
    clientServiceMock = {
      getClients: jest.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [ClientList],
      providers: [
        { provide: ClientService, useValue: clientServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getSeverity', () => {
    it('should return success for ACTIVE', () => {
      expect(component.getSeverity('ACTIVE')).toBe('success');
    });

    it('should return danger for INACTIVE', () => {
      expect(component.getSeverity('INACTIVE')).toBe('danger');
    });
  });

  describe('getStatusLabel', () => {
    it('should return Ativo for ACTIVE', () => {
      expect(component.getStatusLabel('ACTIVE')).toBe('Ativo');
    });

    it('should return Inativo for INACTIVE', () => {
      expect(component.getStatusLabel('INACTIVE')).toBe('Inativo');
    });
  });

  describe('loadClients', () => {
    it('should load clients and set filteredClients on success', () => {
      clientServiceMock.getClients.mockReturnValue(of(mockClients));
      component.loadClients();
      expect(component.clients).toEqual(mockClients);
      expect(component.filteredClients).toEqual(mockClients);
      expect(component.loading).toBe(false);
    });

    it('should set loading to false on error', () => {
      clientServiceMock.getClients.mockReturnValue(throwError(() => new Error('Network error')));
      component.loadClients();
      expect(component.loading).toBe(false);
    });
  });

  describe('onSearch', () => {
    beforeEach(() => {
      component.clients = [...mockClients];
      component.filteredClients = [...mockClients];
    });

    it('should show all clients when search term is empty', () => {
      component.onSearch('');
      expect(component.filteredClients).toHaveLength(2);
    });

    it('should filter by companyName', () => {
      component.onSearch('acme');
      expect(component.filteredClients).toHaveLength(1);
      expect(component.filteredClients[0].id).toBe('1');
    });

    it('should be case-insensitive', () => {
      component.onSearch('BETA');
      expect(component.filteredClients).toHaveLength(1);
      expect(component.filteredClients[0].id).toBe('2');
    });

    it('should filter by status label (Inativo)', () => {
      component.onSearch('inativo');
      expect(component.filteredClients).toHaveLength(1);
      expect(component.filteredClients[0].id).toBe('2');
    });

    it('should filter by email', () => {
      component.onSearch('acme@test.com');
      expect(component.filteredClients).toHaveLength(1);
      expect(component.filteredClients[0].id).toBe('1');
    });

    it('should return empty array when no match found', () => {
      component.onSearch('xxxxxxxxxxx');
      expect(component.filteredClients).toHaveLength(0);
    });
  });

  describe('goToCreate', () => {
    it('should dispatch create event', () => {
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
      component.goToCreate();
      const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(event.type).toBe('client-management-action');
      expect(event.detail.action).toBe('create');
    });
  });

  describe('goToEdit', () => {
    it('should dispatch edit event with clientId', () => {
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
      component.goToEdit('client-123');
      const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.action).toBe('edit');
      expect(event.detail.clientId).toBe('client-123');
    });
  });

  describe('goToDelete', () => {
    it('should dispatch delete event with clientId', () => {
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
      component.goToDelete('client-456');
      const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.action).toBe('delete');
      expect(event.detail.clientId).toBe('client-456');
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove the management event listener', () => {
      const removeSpy = jest.spyOn(window, 'removeEventListener');
      component.ngOnDestroy();
      expect(removeSpy).toHaveBeenCalledWith('client-management-action', expect.any(Function));
    });
  });
});
