import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClientService } from './client.service';
import { Client } from '../models/client.model';

const API_URL = 'http://localhost:3000/api/clients';

const mockClients: Client[] = [
  {
    id: 'c1',
    companyName: 'Acme Corp',
    tradeName: 'Acme',
    cnpj: '12345678000100',
    email: 'acme@test.com',
    phone: '11999999990',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
  },
];

describe('ClientService (mfe-clientes)', () => {
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

  describe('getClients', () => {
    it('should make a GET request to the clients endpoint', () => {
      service.getClients().subscribe((clients) => {
        expect(clients).toEqual(mockClients);
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      req.flush(mockClients);
    });
  });
});
