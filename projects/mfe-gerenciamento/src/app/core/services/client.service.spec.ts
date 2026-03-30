import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClientService } from './client.service';
import { Client } from '../models/client.model';

const API_URL = 'http://localhost:3000/api/clients';

const mockClient: Client = {
  id: 'c1',
  companyName: 'Acme Corp',
  tradeName: 'Acme',
  cnpj: '12345678000100',
  email: 'acme@test.com',
  phone: '11999999990',
  status: 'ACTIVE',
  createdAt: '2024-01-01',
};

describe('ClientService (mfe-gerenciamento)', () => {
  let service: ClientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getClientById', () => {
    it('should make a GET request to the correct URL', () => {
      service.getClientById('c1').subscribe((client) => {
        expect(client).toEqual(mockClient);
      });
      const req = httpMock.expectOne(`${API_URL}/c1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClient);
    });
  });

  describe('createClient', () => {
    it('should make a POST request with the payload', () => {
      const payload = {
        companyName: 'Acme Corp', tradeName: 'Acme', cnpj: '12345678000100',
        email: 'acme@test.com', phone: '11999999990', status: 'ACTIVE' as const,
      };
      service.createClient(payload).subscribe((client) => {
        expect(client).toEqual(mockClient);
      });
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockClient);
    });
  });

  describe('updateClient', () => {
    it('should make a PUT request to the correct URL with payload', () => {
      const payload = { companyName: 'Updated Corp' };
      service.updateClient('c1', payload).subscribe((client) => {
        expect(client).toEqual(mockClient);
      });
      const req = httpMock.expectOne(`${API_URL}/c1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush(mockClient);
    });
  });

  describe('deleteClient', () => {
    it('should make a DELETE request to the correct URL', () => {
      service.deleteClient('c1').subscribe((result) => {
        expect(result).toEqual([]);
      });
      const req = httpMock.expectOne(`${API_URL}/c1`);
      expect(req.request.method).toBe('DELETE');
      req.flush([]);
    });
  });
});
