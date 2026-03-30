import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

const AUTH_TOKEN_KEY = 'bank-client-manager-token';
const USER_STORAGE_KEY = 'bank-client-manager-users';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a new user and return true', async () => {
      const result = await service.register('user@test.com', 'password123');
      expect(result).toBe(true);
      const stored = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) ?? '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].username).toBe('user@test.com');
    });

    it('should store username in lowercase', async () => {
      await service.register('USER@TEST.COM', 'Password123');
      const stored = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) ?? '[]');
      expect(stored[0].username).toBe('user@test.com');
    });

    it('should return false for duplicate username (case-insensitive)', async () => {
      await service.register('user@test.com', 'password123');
      const result = await service.register('USER@TEST.COM', 'password456');
      expect(result).toBe(false);
    });

    it('should return false for empty username', async () => {
      expect(await service.register('', 'password123')).toBe(false);
    });

    it('should return false for empty password', async () => {
      expect(await service.register('user@test.com', '')).toBe(false);
    });

    it('should return false for password shorter than 6 characters', async () => {
      expect(await service.register('user@test.com', 'abc')).toBe(false);
    });

    it('should handle corrupted localStorage gracefully', async () => {
      localStorage.setItem(USER_STORAGE_KEY, 'NOT_JSON');
      const result = await service.register('user@test.com', 'password123');
      expect(result).toBe(true);
    });

    it('should handle non-array stored value gracefully', async () => {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ not: 'array' }));
      const result = await service.register('user@test.com', 'password123');
      expect(result).toBe(true);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await service.register('user@test.com', 'password123');
    });

    it('should login successfully with correct credentials', async () => {
      const result = await service.login('user@test.com', 'password123');
      expect(result).toBe(true);
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).not.toBeNull();
    });

    it('should be case-insensitive for username', async () => {
      const result = await service.login('USER@TEST.COM', 'password123');
      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      expect(await service.login('user@test.com', 'wrongpass')).toBe(false);
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    });

    it('should return false for non-existent user', async () => {
      expect(await service.login('unknown@test.com', 'password123')).toBe(false);
    });

    it('should return false for empty username', async () => {
      expect(await service.login('', 'password123')).toBe(false);
    });

    it('should return false for empty password', async () => {
      expect(await service.login('user@test.com', '')).toBe(false);
    });
  });

  describe('logout', () => {
    it('should remove the auth token from localStorage', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'some-token');
      service.logout();
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'some-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
