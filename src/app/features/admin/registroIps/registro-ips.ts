import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { RegistroIpsService } from './registro-ips.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-registro-ips',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './registro-ips.html',
    styleUrls: ['./registro-ips.css']
})
export class RegistroIps {
    form: FormGroup;
    submitted = false;
    isLoading = false;

    // Opciones para los select

    regionales = [
        'Regional Norte',
        'Regional Centro',
        'Regional Sur',
        'Regional Oriente',
        'Regional Occidente',
        'Regional Costa Atlántica',
        'Regional Costa Pacífica'
    ];

    estados = ['ACTIVA', 'INACTIVA', 'SUSPENDIDA'];

    tiposAtencion = [
        'Urgencias',
        'Consulta Externa',
        'Hospitalización',
        'Cirugía',
        'UCI',
        'Urgencias y Consulta Externa',
        'Atención Integral'
    ];

    especialidades = [
        'Medicina General',
        'Cardiología',
        'Pediatría',
        'Ginecología',
        'Ortopedia',
        'Neurología',
        'Dermatología',
        'Psiquiatría',
        'Oftalmología',
        'Otorrinolaringología',
        'Urología',
        'Endocrinología',
        'Gastroenterología',
        'Neumología',
        'Oncología'
    ];

    nivelesComplejidad = ['I', 'II', 'III', 'IV'];

    horariosAtencion = [
        '8:00 AM - 5:00 PM',
        '24 horas',
        '6:00 AM - 10:00 PM',
        'Lunes a Viernes 8:00 AM - 6:00 PM',
        'Lunes a Sábado 7:00 AM - 7:00 PM'
    ];

    constructor(
        private fb: FormBuilder,
        private registroIpsService: RegistroIpsService
    ) {
        this.form = this.fb.group({
            NOMBRE_IPS: ['', [Validators.required, Validators.maxLength(100)]],
            NIT: ['', [Validators.required, Validators.pattern(/^\d{9,10}-\d$/)]],
            DIRECCION: ['', [Validators.required, Validators.maxLength(150)]],
            TELEFONO: ['', [Validators.required, Validators.pattern(/^\d{7,12}$/)]],
            CORREO: ['', [Validators.required, Validators.email]],
            REPRESENTANTE: ['', [Validators.required, Validators.maxLength(100)]],
            CIUDAD: ['', [Validators.required]],
            DEPARTAMENTO: ['', [Validators.required]],
            REGIONAL: ['', [Validators.required]],
            ESTADO: ['ACTIVA', [Validators.required]],
            
            // Campos para COMPLEMENTARIA_1
            tipo_atencion: ['', [Validators.required]],
            especialidades: this.fb.array([]),
            
            // Campos para COMPLEMENTARIA_2
            horario_atencion: ['', [Validators.required]],
            nivel_complejidad: ['', [Validators.required]]
        });

    }

    get especialidadesArray(): FormArray {
        return this.form.get('especialidades') as FormArray;
    }

    onEspecialidadChange(especialidad: string, event: any): void {
        const especialidadesArray = this.especialidadesArray;
        
        if (event.target.checked) {
            especialidadesArray.push(this.fb.control(especialidad));
        } else {
            const index = especialidadesArray.controls.findIndex(x => x.value === especialidad);
            if (index >= 0) {
                especialidadesArray.removeAt(index);
            }
        }
    }

    isEspecialidadSelected(especialidad: string): boolean {
        return this.especialidadesArray.value.includes(especialidad);
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.form.invalid) {
            this.markFormGroupTouched();
            Swal.fire({
                title: 'Formulario Incompleto',
                text: 'Por favor, complete todos los campos requeridos.',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        this.isLoading = true;

        // Construir el objeto JSON según la estructura requerida
        const ipsData = {
            NOMBRE_IPS: this.form.get('NOMBRE_IPS')?.value,
            NIT: this.form.get('NIT')?.value,
            DIRECCION: this.form.get('DIRECCION')?.value,
            TELEFONO: this.form.get('TELEFONO')?.value,
            CORREO: this.form.get('CORREO')?.value,
            REPRESENTANTE: this.form.get('REPRESENTANTE')?.value,
            CIUDAD: this.form.get('CIUDAD')?.value,
            DEPARTAMENTO: this.form.get('DEPARTAMENTO')?.value,
            REGIONAL: this.form.get('REGIONAL')?.value,
            ESTADO: this.form.get('ESTADO')?.value,
            COMPLEMENTARIA_1: {
                tipo_atencion: this.form.get('tipo_atencion')?.value,
                especialidades: this.especialidadesArray.value
            },
            COMPLEMENTARIA_2: {
                horario_atencion: this.form.get('horario_atencion')?.value,
                nivel_complejidad: this.form.get('nivel_complejidad')?.value
            }
        };

        this.registroIpsService.registrarIps(ipsData).subscribe({
            next: (response) => {
                this.isLoading = false;
                
                if (response.error === 0) {
                    Swal.fire({
                        title: '¡Éxito!',
                        text: response.response?.mensaje || 'IPS registrada exitosamente',
                        icon: 'success',
                        confirmButtonText: 'Continuar'
                    }).then(() => {
                        this.resetForm();
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: response.response?.mensaje || 'Error al registrar la IPS',
                        icon: 'error',
                        confirmButtonText: 'Entendido'
                    });
                }
            },
            error: (error) => {
                this.isLoading = false;
                console.error('Error al registrar IPS:', error);
                
                Swal.fire({
                    title: 'Error de Conexión',
                    text: 'No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.',
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
            }
        });
    }

    resetForm(): void {
        this.form.reset();
        this.submitted = false;
        this.especialidadesArray.clear();
        
        // Restablecer valores por defecto
        this.form.patchValue({
            ESTADO: 'ACTIVA'
        });
    }

    private markFormGroupTouched(): void {
        Object.keys(this.form.controls).forEach(key => {
            const control = this.form.get(key);
            control?.markAsTouched();
        });
    }

    // Métodos de validación para mostrar errores
    isFieldInvalid(fieldName: string): boolean {
        const field = this.form.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
    }

    getFieldError(fieldName: string): string {
        const field = this.form.get(fieldName);
        if (field?.errors) {
            if (field.errors['required']) return 'Este campo es requerido';
            if (field.errors['email']) return 'Ingrese un email válido';
            if (field.errors['pattern']) {
                if (fieldName === 'NIT') return 'Formato: 123456789-0';
                if (fieldName === 'TELEFONO') return 'Ingrese un teléfono válido';
            }
            if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
        }
        return '';
    }
}