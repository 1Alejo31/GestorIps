import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-aside',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './aside.html',
    styleUrls: ['./aside.css']
})

export class Aside {
    constructor(private router: Router) { }

    @Input() activePanel: string = 'dashboard';
    @Output() selectPanel = new EventEmitter<string>();

    openRegistroUsuarios() {
        this.selectPanel.emit('registroUsuarios');
    }

    openGestorIps() {
        this.selectPanel.emit('gestorIps');
    }

    openIpsGestion() {
        this.selectPanel.emit('ipsGestion');
    }

    openHojaVida() {
        this.selectPanel.emit('hojaVida');
    }
}