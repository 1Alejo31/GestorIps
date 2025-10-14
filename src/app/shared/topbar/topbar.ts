import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './topbar.html',
    styleUrls: ['./topbar.css']
})

export class Topbar implements OnInit {

    constructor(private router: Router) { }

    @Output() menuToggle = new EventEmitter<void>();
    @Output() importClick = new EventEmitter<void>();
    @Output() filterClick = new EventEmitter<void>();
    @Output() downloadClick = new EventEmitter<void>();
    @Output() logoutClick = new EventEmitter<void>();

    displayName = 'Usuario';
    initials = 'U';

    ngOnInit(): void {
        try {
            const raw = localStorage.getItem('user');
            if (raw) {
                const user = JSON.parse(raw);
                const nameCandidates = [
                    user?.name,
                    user?.nombre,
                    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim(),
                    user?.username,
                    user?.email
                ].filter((v: string | undefined) => !!v && String(v).trim().length > 0) as string[];

                const picked = nameCandidates[0] ?? 'Usuario';
                this.displayName = String(picked).trim();
                this.initials = this.computeInitials(this.displayName);
            }
        } catch {
            this.displayName = 'Usuario';
            this.initials = 'U';
        }
    }

    onToggleMenu() {
        this.menuToggle.emit();
    }
    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
    }

    onLogout() {
        this.logoutClick.emit();
    }

    private computeInitials(name: string): string {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        const first = parts[0]?.charAt(0) ?? 'U';
        const last = parts[parts.length - 1]?.charAt(0) ?? '';
        return (first + last).toUpperCase();
    }
}