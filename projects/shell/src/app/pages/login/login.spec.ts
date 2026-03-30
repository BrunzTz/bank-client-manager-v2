import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Login } from './login';
import { AuthService } from '../../core/services/auth/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceMock: { login: jest.Mock; register: jest.Mock };
  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      login: jest.fn(),
      register: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hasError', () => {
    it('should return false when field is untouched', () => {
      expect(component.hasError('username', 'required', false)).toBe(false);
    });

    it('should return true when loginForm field is touched and has the error', () => {
      component.loginForm.get('username')?.markAsTouched();
      expect(component.hasError('username', 'required', false)).toBe(true);
    });

    it('should return false when loginForm field is touched but error does not match', () => {
      component.loginForm.get('username')?.setValue('valid@email.com');
      component.loginForm.get('username')?.markAsTouched();
      expect(component.hasError('username', 'required', false)).toBe(false);
    });

    it('should check signUpForm when isSignUp is true', () => {
      component.signUpForm.get('username')?.markAsTouched();
      expect(component.hasError('username', 'required', true)).toBe(true);
    });

    it('should return false for missing field name', () => {
      expect(component.hasError('nonExistent', 'required', false)).toBe(false);
    });
  });

  describe('submit', () => {
    it('should mark form as touched and set error message when form is invalid', async () => {
      await component.submit();
      expect(component.errorMessage).toBe('Preencha os campos corretamente antes de submeter.');
      expect(component.loginForm.touched).toBe(true);
      expect(component.invalidCredentials).toBe(false);
    });

    it('should set invalidCredentials and errorMessage when login fails', async () => {
      authServiceMock.login.mockResolvedValue(false);
      component.loginForm.setValue({ username: 'user@test.com', password: 'pass123' });
      await component.submit();
      expect(component.invalidCredentials).toBe(true);
      expect(component.errorMessage).toBeTruthy();
      expect(component.isLoading).toBe(false);
    });

    it('should navigate to /home on successful login', async () => {
      authServiceMock.login.mockResolvedValue(true);
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.loginForm.setValue({ username: 'user@test.com', password: 'pass123' });
      await component.submit();
      expect(authServiceMock.login).toHaveBeenCalledWith('user@test.com', 'pass123');
      expect(navigateSpy).toHaveBeenCalledWith(['/home']);
      expect(component.isLoading).toBe(false);
    });

    it('should clear previous error messages before submitting', async () => {
      authServiceMock.login.mockResolvedValue(true);
      jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component.invalidCredentials = true;
      component.errorMessage = 'old error';
      component.loginForm.setValue({ username: 'user@test.com', password: 'pass123' });
      await component.submit();
      expect(component.errorMessage).toBe('');
    });
  });

  describe('signUp', () => {
    it('should mark form as touched and set error when form is invalid', async () => {
      await component.signUp();
      expect(component.errorMessage).toBe('Preencha os campos corretamente para cadastrar.');
      expect(component.successMessage).toBe('');
    });

    it('should set error when passwords do not match', async () => {
      component.signUpForm.setValue({
        username: 'user@test.com',
        password: 'pass123',
        confirmPassword: 'different',
      });
      await component.signUp();
      expect(component.errorMessage).toBe('Senhas não conferem.');
      expect(component.successMessage).toBe('');
    });

    it('should call register and show success on valid form', async () => {
      authServiceMock.register.mockResolvedValue(true);
      component.signUpForm.setValue({
        username: 'user@test.com',
        password: 'pass123',
        confirmPassword: 'pass123',
      });
      await component.signUp();
      expect(authServiceMock.register).toHaveBeenCalledWith('user@test.com', 'pass123');
      expect(component.successMessage).toBe('Cadastro realizado! Faça login.');
      expect(component.activeTab).toBe('login');
      expect(component.isLoading).toBe(false);
    });

    it('should set errorMessage when registration fails', async () => {
      authServiceMock.register.mockResolvedValue(false);
      component.signUpForm.setValue({
        username: 'user@test.com',
        password: 'pass123',
        confirmPassword: 'pass123',
      });
      await component.signUp();
      expect(component.errorMessage).toBe('Erro ao cadastrar. Tente novamente.');
      expect(component.isLoading).toBe(false);
    });
  });
});
