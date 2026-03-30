import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { MainLayout } from './shared/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { 
        path: '', 
        component: Login 
    },
    { 
        path: 'login', 
        component: Login 
    },
    { 
        path: 'home', 
        canActivate: [authGuard],
        component: MainLayout 
    },
];
