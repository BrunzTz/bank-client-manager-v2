import { TestBed } from '@angular/core/testing';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { MicroFrontendService } from './micro-frontend.service';

describe('MicroFrontendService', () => {
  let service: MicroFrontendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MicroFrontendService);
    (loadRemoteModule as jest.Mock).mockReset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadRemoteComponent', () => {
    it('should return the remote module on success', async () => {
      const mockModule = { MyComponent: class {} };
      (loadRemoteModule as jest.Mock).mockResolvedValue(mockModule);
      const result = await service.loadRemoteComponent(4201, 'mfe-clientes', './ClientList');
      expect(result).toBe(mockModule);
      expect(loadRemoteModule).toHaveBeenCalledWith({
        exposedModule: './ClientList',
        remoteName: 'mfe-clientes',
        remoteEntry: 'http://localhost:4201/remoteEntry.json',
        fallback: 'unauthorized',
      });
    });

    it('should rethrow the error when loadRemoteModule fails', async () => {
      const error = new Error('Remote not available');
      (loadRemoteModule as jest.Mock).mockRejectedValue(error);
      await expect(service.loadRemoteComponent(4202, 'mfe-gerenciamento', './ClientManagementPage')).rejects.toThrow('Remote not available');
    });
  });
});
