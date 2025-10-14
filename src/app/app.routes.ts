import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { Login } from './features/login/login';
import { Home } from './features/home/home';
import { RegistroUsuarios } from './features/admin/registroUsuarios/registro-usuarios';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    {
        path: 'home',
        component: Home,
        canActivate: [() => {
            const router = inject(Router);
            const hasToken = !!localStorage.getItem('token');
            if (!hasToken) {
                router.navigate(['/login']);
                return false;
            }
            return true;
        }]
    },
    { path: 'admin/registro-usuarios', component: RegistroUsuarios /*, canActivate: [authGuard]*/ },
    { path: '**', redirectTo: 'login' }
];
