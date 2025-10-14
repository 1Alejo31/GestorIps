import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Topbar } from "../../shared/topbar/topbar";
import { Aside } from "../../shared/aside/aside";
import { RegistroUsuarios } from "../../features/admin/registroUsuarios/registro-usuarios";

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
    imports: [CommonModule, Topbar, Aside, RegistroUsuarios],
    templateUrl: './home.html',
    styleUrls: ['./home.css'],
})
export class Home implements OnInit {

    user: User | null = null;

    constructor(private router: Router) { }

    ngOnInit(): void {
        const raw = localStorage.getItem('user');
        this.user = raw ? JSON.parse(raw) as User : null;

        if (!this.user) {
            this.router.navigate(['/login']);
        }
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

    activePanel: 'dashboard' | 'registroUsuarios' = 'dashboard';

    activatePanel(panel: string) {
        // Acepta string y asegura que sólo se asignen paneles válidos
        if (panel === 'dashboard' || panel === 'registroUsuarios') {
            this.activePanel = panel;
        }
    }
}