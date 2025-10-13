import { Routes } from '@angular/router';
import { Login } from './features/login/login';

export const routes: Routes = [
    {
        path: '',
        component: Login,
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: Login
    }
];
