import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from './login.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginData = {
    email: '',
    password: '',
    errorMessage: ''
  }

  constructor(private loginService: LoginService, private router: Router) { }

  private extractApiErrorMessage(err: any): string {
    try {
      if (err?.error) {
        const e = err.error;
        if (typeof e === 'string') return e;
        if (e?.response?.mensaje) return e.response.mensaje;
        if (e?.mensaje) return e.mensaje;
        if (e?.message) return e.message;
      }
      return err?.message ?? 'Ocurrió un error';
    } catch {
      return 'Ocurrió un error';
    }
  }

  login() {

    if (!this.loginData.email || !this.loginData.password) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, complete todos los campos'
      });
      return;
    }

    const credentials = { email: this.loginData.email, password: this.loginData.password };

    this.loginService.loginService(credentials).subscribe({
      next: (res: any) => {
        if (res?.error === 1) {
          const msg = res?.response?.mensaje ?? 'Credenciales inválidas';
          this.loginData.errorMessage = msg;
          localStorage.setItem('token', '');
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: msg
          });
          return;
        }

        this.loginData.errorMessage = '';
        localStorage.setItem('token', res.response.token);
        const msg = res?.response?.mensaje ?? 'Login exitoso';
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        const msg = this.extractApiErrorMessage(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: msg
        });
      }
    });
  }
}
