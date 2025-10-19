import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Topbar } from "../../shared/topbar/topbar";
import { Aside } from "../../shared/aside/aside";
import { RegistroUsuarios } from "../../features/admin/registroUsuarios/registro-usuarios";
import { HojaVida } from "../../features/admin/HojaVida/hoja-vida";
import Swal from 'sweetalert2';

interface User {
    perfil: string;
    empresa: string;
    nombre: string;
    apellido: string;
    correo: string;
    cel: string;
    permiso: string;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, Topbar, Aside, RegistroUsuarios, HojaVida],
    templateUrl: './home.html',
    styleUrls: ['./home.css'],
})
export class Home implements OnInit, OnDestroy {

    user: User | null = null;
    private tokenCheckInterval: any;

    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        // Verificar autenticación inicial
        if (!this.authService.isAuthenticated()) {
            this.authService.logout();
            return;
        }

        // Obtener información del usuario
        this.user = this.authService.getUserInfo();

        if (!this.user) {
            this.authService.logout();
            return;
        }

        // Configurar verificación periódica del token cada 2 minutos
        this.tokenCheckInterval = setInterval(() => {
            this.checkAuthStatus();
        }, 120000); // 2 minutos

        // Verificación inicial
        this.checkAuthStatus();
    }

    hasPermiso(tipo: 'Lectura' | 'Escritura'): boolean {
        const permiso = this.user?.permiso?.toLowerCase() ?? '';
        return permiso.includes(tipo.toLowerCase());
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
    }

    isSidebarCollapsed = false;

    toggleSidebar(): void {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    activePanel: 'dashboard' | 'registroUsuarios' | 'hojaVida' = 'dashboard';

    activatePanel(panel: string) {
        if (panel === 'dashboard' || panel === 'registroUsuarios' || panel === 'hojaVida') {
            this.activePanel = panel;
        }
    }

    getSessionDuration(): number {
        return this.authService.getSessionDuration();
    }

    checkAuthStatus(): void {
        if (!this.authService.isAuthenticated()) {
            Swal.fire({
                title: 'Sesión Inválida',
                text: 'Tu sesión ha expirado. Serás redirigido al login.',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            }).then(() => {
                this.authService.logout();
            });
        }
    }

    ngOnDestroy(): void {
        if (this.tokenCheckInterval) {
            clearInterval(this.tokenCheckInterval);
        }
    }
}