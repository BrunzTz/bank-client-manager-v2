import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, CardModule, TabsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  invalidCredentials = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  activeTab = 'login';

  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  signUpForm = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  hasError(field: string, error: string, isSignUp: boolean): boolean {
    const control = isSignUp ? this.signUpForm.get(field) : this.loginForm.get(field);
    return !!(control?.hasError(error) && control?.touched);
  }

  async submit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.invalidCredentials = false;
      this.errorMessage = 'Preencha os campos corretamente antes de submeter.';
      return;
    }

    this.isLoading = true;
    this.invalidCredentials = false;
    this.errorMessage = '';
    this.successMessage = '';

    const username = (this.loginForm.value.username ?? '').trim();
    const password = (this.loginForm.value.password ?? '').trim();

    const success = await this.authService.login(username, password);

    this.isLoading = false;

    if (!success) {
      this.invalidCredentials = true;
      this.errorMessage = 'Usuário ou senha incorretos. Faça cadastro primeiro ou use credenciais corretas.';
      return;
    }

    await this.router.navigate(['/home']);
  }

  async signUp(): Promise<void> {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      this.errorMessage = 'Preencha os campos corretamente para cadastrar.';
      this.successMessage = '';
      return;
    }

    const username = (this.signUpForm.value.username ?? '').trim();
    const password = (this.signUpForm.value.password ?? '').trim();
    const confirmPassword = (this.signUpForm.value.confirmPassword ?? '').trim();

    if (password !== confirmPassword) {
      this.errorMessage = 'Senhas não conferem.';
      this.successMessage = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const success = await this.authService.register(username, password);

    this.isLoading = false;

    if (!success) {
      this.errorMessage = 'Erro ao cadastrar. Tente novamente.';
      return;
    }

    this.successMessage = 'Cadastro realizado! Faça login.';
    this.signUpForm.reset();
    this.activeTab = 'login';
  }
}
