import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IpsGestionService } from './ips-gestion.service';
import { AuthService } from '../../../core/auth.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

interface HojaVida {
    _id: string;
    PKEYHOJAVIDA: string;
    PKEYASPIRANT: string;
    CODIPROGACAD: string;
    ANNOPERIACAD: number;
    NUMEPERIACAD: string;
    CODIGO_INSCRIPCION: string;
    DOCUMENTO: string;
    NOMBRE: string;
    PRIMER_APELLIDO: string;
    SEGUNDO_APELLIDO: string;
    EDAD: number;
    GENERO: string;
    FECH_NACIMIENTO: string;
    CORREO: string;
    TELEFONO: string;
    CELULAR: string;
    DIRECCION: string;
    CIUDAD: string;
    ESTADO: string;
    DEPARTAMENTO: string;
    REGIONAL: string;
    COMPLEMENTARIA_1: string;
    COMPLEMENTARIA_2: string;
    FECHA_INSCRIPCION: string;
    GRUP_MINO: string;
    ESTRATO: string;
    TIPO_MEDIO: string;
    COLEGIO: string;
    createdAt: string;
    updatedAt: string;
}

@Component({
    selector: 'app-ips-gestion',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './ips-gestion.html',
    styleUrls: ['./ips-gestion.css']
})
export class IpsGestion implements OnInit {

    activeTab = 'consulta';

    // Propiedades para consulta
    hojasVida: HojaVida[] = [];
    hojasVidaFiltradas: HojaVida[] = [];
    isLoadingConsulta = false;
    searchTerm = '';
    currentPage = 1;
    itemsPerPage = 10;
    totalItems = 0;

    // Formulario de agendamiento
    agendamientoForm!: FormGroup;
    isLoadingAgendamiento = false;

    Math = Math;

    constructor(
        private ipsGestionService: IpsGestionService,
        private fb: FormBuilder,
        private authService: AuthService
    ) {
        this.initializeAgendamientoForm();
    }

    ngOnInit(): void {
        this.consultarHojasVida();
    }

    private initializeAgendamientoForm(): void {
        this.agendamientoForm = this.fb.group({
            fechaHora: ['', [Validators.required]],
            examenes: ['', [Validators.required, Validators.maxLength(500)]],
            recomendaciones: ['', [Validators.required, Validators.maxLength(500)]]
        });
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
        if (tab === 'consulta') {
            this.consultarHojasVida();
        }
    }

    consultarHojasVida() {
        this.isLoadingConsulta = true;
        this.ipsGestionService.consultarHojasVida().subscribe({
            next: (response) => {
                this.isLoadingConsulta = false;

                if (response.error === 0) {
                    this.hojasVida = response.response.hojas_vida || [];
                    this.totalItems = response.response.total_registros || 0;
                    this.filtrarHojasVida();
                } else {
                    console.error('Error en la respuesta:', response);
                    Swal.fire({
                        title: 'Error',
                        text: response.response?.mensaje || 'Error al consultar las hojas de vida',
                        icon: 'error',
                        confirmButtonText: 'Entendido'
                    });
                }
            },
            error: (error) => {
                this.isLoadingConsulta = false;
                console.error('Error al consultar hojas de vida:', error);

                Swal.fire({
                    title: 'Error de Conexión',
                    text: 'No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.',
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
            }
        });
    }

    filtrarHojasVida() {
        if (!this.searchTerm.trim()) {
            this.hojasVidaFiltradas = [...this.hojasVida];
        } else {
            const termino = this.searchTerm.toLowerCase();
            this.hojasVidaFiltradas = this.hojasVida.filter(hoja =>
                hoja.NOMBRE.toLowerCase().includes(termino) ||
                hoja.PRIMER_APELLIDO.toLowerCase().includes(termino) ||
                hoja.DOCUMENTO.toLowerCase().includes(termino) ||
                hoja.CORREO.toLowerCase().includes(termino) ||
                hoja.CIUDAD.toLowerCase().includes(termino) ||
                hoja.DEPARTAMENTO.toLowerCase().includes(termino)
            );
        }
        this.currentPage = 1;
    }

    onSearchChange() {
        this.filtrarHojasVida();
    }

    get paginatedHojasVida() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.hojasVidaFiltradas.slice(startIndex, endIndex);
    }

    get totalPages() {
        return Math.ceil(this.hojasVidaFiltradas.length / this.itemsPerPage);
    }

    changePage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    verDetalle(hoja: HojaVida) {
        let html = '<div class="container-fluid">';

        // Información Básica
        html += '<div class="card mb-3">';
        html += '<div class="card-header bg-primary text-white">';
        html += '<h6 class="mb-0"><i class="fas fa-user me-2"></i>Información Básica</h6>';
        html += '</div>';
        html += '<div class="card-body">';
        html += '<div class="row">';

        const basicFields = [
            { key: 'DOCUMENTO', label: '🆔 Documento', value: hoja.DOCUMENTO },
            { key: 'NOMBRE', label: '👤 Nombre Completo', value: `${hoja.NOMBRE} ${hoja.PRIMER_APELLIDO} ${hoja.SEGUNDO_APELLIDO}`.trim() },
            { key: 'EDAD', label: '🎂 Edad', value: hoja.EDAD },
            { key: 'GENERO', label: '⚧ Género', value: hoja.GENERO },
            { key: 'FECH_NACIMIENTO', label: '📅 Fecha de Nacimiento', value: new Date(hoja.FECH_NACIMIENTO).toLocaleDateString('es-CO') },
            { key: 'ESTADO', label: '📊 Estado', value: hoja.ESTADO, isBadge: true }
        ];

        basicFields.forEach(field => {
            html += `<div class="col-md-6 mb-2 p-2" style="border-radius: 5px;">`;
            html += `<strong class="text-muted">${field.label}:</strong><br>`;

            if (field.isBadge) {
                const badgeClass = field.value === 'Activo' ? 'bg-success' : 'bg-danger';
                html += `<span class="badge ${badgeClass}" style="font-size: 1em;">${field.value}</span>`;
            } else {
                html += `<span class="text-dark" style="font-size: 1.1em; font-family: monospace;">${field.value || 'N/A'}</span>`;
            }
            html += `</div>`;
        });

        html += '</div></div></div>';

        // Información de Contacto
        html += '<div class="card mb-3">';
        html += '<div class="card-header bg-info text-white">';
        html += '<h6 class="mb-0"><i class="fas fa-address-book me-2"></i>Información de Contacto</h6>';
        html += '</div>';
        html += '<div class="card-body">';
        html += '<div class="row">';

        const contactFields = [
            { key: 'CORREO', label: '📧 Correo Electrónico', value: hoja.CORREO },
            { key: 'TELEFONO', label: '📞 Teléfono', value: hoja.TELEFONO },
            { key: 'CELULAR', label: '📱 Celular', value: hoja.CELULAR },
            { key: 'DIRECCION', label: '🏠 Dirección', value: hoja.DIRECCION },
            { key: 'CIUDAD', label: '🏙️ Ciudad', value: hoja.CIUDAD },
            { key: 'DEPARTAMENTO', label: '🗺️ Departamento', value: hoja.DEPARTAMENTO }
        ];

        contactFields.forEach(field => {
            html += `<div class="col-md-6 mb-2 p-2" style="border-radius: 5px;">`;
            html += `<strong class="text-muted">${field.label}:</strong><br>`;
            html += `<span class="text-dark" style="font-size: 1.1em; font-family: monospace;">${field.value || 'N/A'}</span>`;
            html += `</div>`;
        });

        html += '</div></div></div>';

        // Información Académica
        html += '<div class="card mb-3">';
        html += '<div class="card-header bg-warning text-dark">';
        html += '<h6 class="mb-0"><i class="fas fa-graduation-cap me-2"></i>Información Académica</h6>';
        html += '</div>';
        html += '<div class="card-body">';
        html += '<div class="row">';

        const academicFields = [
            { key: 'CODIGO_INSCRIPCION', label: '🎓 Código de Inscripción', value: hoja.CODIGO_INSCRIPCION },
            { key: 'CODIPROGACAD', label: '📚 Código Programa Académico', value: hoja.CODIPROGACAD },
            { key: 'ANNOPERIACAD', label: '📅 Año Período Académico', value: hoja.ANNOPERIACAD },
            { key: 'NUMEPERIACAD', label: '🔢 Número Período Académico', value: hoja.NUMEPERIACAD },
            { key: 'COLEGIO', label: '🏫 Colegio', value: hoja.COLEGIO },
            { key: 'FECHA_INSCRIPCION', label: '📝 Fecha de Inscripción', value: hoja.FECHA_INSCRIPCION }
        ];

        academicFields.forEach(field => {
            html += `<div class="col-md-6 mb-2 p-2" style="border-radius: 5px;">`;
            html += `<strong class="text-muted">${field.label}:</strong><br>`;
            html += `<span class="text-dark" style="font-size: 1.1em; font-family: monospace;">${field.value || 'N/A'}</span>`;
            html += `</div>`;
        });

        html += '</div></div></div>';

        // Información Adicional
        html += '<div class="card mb-3">';
        html += '<div class="card-header bg-secondary text-white">';
        html += '<h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Información Adicional</h6>';
        html += '</div>';
        html += '<div class="card-body">';
        html += '<div class="row">';

        const additionalFields = [
            { key: 'REGIONAL', label: '🌍 Regional', value: hoja.REGIONAL },
            { key: 'GRUP_MINO', label: '👥 Grupo Minoritario', value: hoja.GRUP_MINO },
            { key: 'ESTRATO', label: '🏘️ Estrato', value: hoja.ESTRATO },
            { key: 'TIPO_MEDIO', label: '📢 Tipo de Medio', value: hoja.TIPO_MEDIO },
            { key: 'COMPLEMENTARIA_1', label: '📋 Complementaria 1', value: hoja.COMPLEMENTARIA_1 },
            { key: 'COMPLEMENTARIA_2', label: '📋 Complementaria 2', value: hoja.COMPLEMENTARIA_2 }
        ];

        additionalFields.forEach(field => {
            html += `<div class="col-md-6 mb-2 p-2" style="border-radius: 5px;">`;
            html += `<strong class="text-muted">${field.label}:</strong><br>`;
            html += `<span class="text-dark" style="font-size: 1.1em; font-family: monospace;">${field.value || 'N/A'}</span>`;
            html += `</div>`;
        });

        html += '</div></div></div>';

        html += '</div>';

        Swal.fire({
            title: `Hoja de Vida - ${hoja.NOMBRE} ${hoja.PRIMER_APELLIDO}`,
            html: html,
            icon: 'info',
            width: '900px',
            showCloseButton: true,
            confirmButtonText: 'Cerrar',
            customClass: {
                popup: 'swal-wide'
            }
        });
    }

    agendar(hoja: HojaVida) {
        this.agendamientoForm.reset();

        Swal.fire({
            title: `Agendar Cita - ${hoja.NOMBRE} ${hoja.PRIMER_APELLIDO}`,
            html: `
                <div class="container-fluid">
                    <form id="agendamientoForm">
                        <div class="mb-3">
                            <label for="fechaHora" class="form-label text-start d-block">
                                <i class="fas fa-calendar-alt me-2"></i>Fecha y Hora de Agendamiento
                            </label>
                            <input type="datetime-local" id="fechaHora" class="form-control" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="examenes" class="form-label text-start d-block">
                                <i class="fas fa-stethoscope me-2"></i>Exámenes a Realizar
                            </label>
                            <textarea id="examenes" class="form-control" rows="3" 
                                placeholder="Describa los exámenes médicos a realizar..." 
                                maxlength="500" required></textarea>
                            <small class="text-muted">Máximo 500 caracteres</small>
                        </div>
                        
                        <div class="mb-3">
                            <label for="recomendaciones" class="form-label text-start d-block">
                                <i class="fas fa-clipboard-list me-2"></i>Recomendaciones
                            </label>
                            <textarea id="recomendaciones" class="form-control" rows="3" 
                                placeholder="Escriba las recomendaciones para el paciente..." 
                                maxlength="500" required></textarea>
                            <small class="text-muted">Máximo 500 caracteres</small>
                        </div>
                    </form>
                </div>
            `,
            width: '600px',
            showCancelButton: true,
            confirmButtonText: 'Agendar Cita',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            preConfirm: () => {
                const fechaHora = (document.getElementById('fechaHora') as HTMLInputElement).value;
                const examenes = (document.getElementById('examenes') as HTMLTextAreaElement).value;
                const recomendaciones = (document.getElementById('recomendaciones') as HTMLTextAreaElement).value;

                if (!fechaHora || !examenes.trim() || !recomendaciones.trim()) {
                    Swal.showValidationMessage('Todos los campos son obligatorios');
                    return false;
                }

                if (examenes.length > 500 || recomendaciones.length > 500) {
                    Swal.showValidationMessage('Los campos no pueden exceder 500 caracteres');
                    return false;
                }

                return {
                    fechaHora,
                    examenes: examenes.trim(),
                    recomendaciones: recomendaciones.trim(),
                    hojaVidaId: hoja._id,
                    paciente: `${hoja.NOMBRE} ${hoja.PRIMER_APELLIDO}`,
                    documento: hoja.DOCUMENTO
                };
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                this.procesarAgendamiento(result.value);
            }
        });
    }

    private procesarAgendamiento(datosAgendamiento: any) {
        this.isLoadingAgendamiento = true;

        // Obtener información del usuario autenticado
        let userInfo = this.authService.getUserInfo();

        // TEMPORAL: Si no existen los IDs, agregarlos al localStorage
        if (userInfo && (!userInfo.id || !userInfo.ips_id)) {
            console.log('🔧 Actualizando localStorage con IDs temporales...');
            userInfo.id = userInfo.id || 'USER_TEMP_ID_123';
            userInfo.ips_id = userInfo.ips_id || 'IPS_TEMP_ID_456';
            localStorage.setItem('user', JSON.stringify(userInfo));
            console.log('✅ localStorage actualizado:', userInfo);
        }

        // Verificar si tenemos los IDs necesarios
        if (!userInfo?.id || !userInfo?.ips_id) {
            console.warn('⚠️ ADVERTENCIA: Faltan ID de usuario o IPS. Es necesario hacer logout y login nuevamente.');
            
            Swal.fire({
                title: 'Información Incompleta',
                text: 'Para completar el agendamiento, es necesario cerrar sesión y volver a iniciar sesión.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Cerrar Sesión',
                cancelButtonText: 'Continuar Sin IDs',
                confirmButtonColor: '#dc3545'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.authService.logout();
                    return;
                }
            });
        }

        // Construir el payload para actualizar el documento de hoja de vida
        const updatePayload = {
            hojaVidaId: datosAgendamiento.hojaVidaId,
            fecha_hora: datosAgendamiento.fechaHora,
            examenes: datosAgendamiento.examenes,
            recomendaciones: datosAgendamiento.recomendaciones,
            usuario_id: userInfo?.id || 'USUARIO_NO_IDENTIFICADO',
            ips_id: userInfo?.ips_id || 'IPS_NO_IDENTIFICADA'
        };

        // Imprimir el JSON en la consola
        console.log('Datos para actualizar hoja de vida:', JSON.stringify(updatePayload, null, 2));

        // Llamar al servicio para actualizar la hoja de vida
        this.ipsGestionService.agendarCita(updatePayload).subscribe({
            next: (response) => {
                this.isLoadingAgendamiento = false;
                console.log('Respuesta del servicio:', response);

                Swal.fire({
                    title: '¡Cita Agendada Exitosamente!',
                    html: `
                        <div class="text-start">
                            <p><strong>Paciente:</strong> ${datosAgendamiento.paciente}</p>
                            <p><strong>Documento:</strong> ${datosAgendamiento.documento}</p>
                            <p><strong>Fecha y Hora:</strong> ${new Date(datosAgendamiento.fechaHora).toLocaleString('es-CO')}</p>
                            <p><strong>Exámenes:</strong> ${datosAgendamiento.examenes}</p>
                            <p><strong>Recomendaciones:</strong> ${datosAgendamiento.recomendaciones}</p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#28a745'
                });

                // Actualizar la lista de hojas de vida para reflejar los cambios
                this.consultarHojasVida();
            },
            error: (error) => {
                this.isLoadingAgendamiento = false;
                console.error('Error al agendar cita:', error);

                Swal.fire({
                    title: 'Error al Agendar',
                    text: 'No se pudo agendar la cita. Por favor, intente nuevamente.',
                    icon: 'error',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#dc3545'
                });
            }
        });
    }

    exportarExcel() {
        if (this.hojasVidaFiltradas.length === 0) {
            Swal.fire({
                title: 'Sin Datos',
                text: 'No hay hojas de vida para exportar',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const datosExport = this.hojasVidaFiltradas.map(hoja => ({
            'Documento': hoja.DOCUMENTO,
            'Nombre Completo': `${hoja.NOMBRE} ${hoja.PRIMER_APELLIDO} ${hoja.SEGUNDO_APELLIDO}`.trim(),
            'Edad': hoja.EDAD,
            'Género': hoja.GENERO,
            'Correo': hoja.CORREO,
            'Teléfono': hoja.TELEFONO,
            'Celular': hoja.CELULAR,
            'Ciudad': hoja.CIUDAD,
            'Departamento': hoja.DEPARTAMENTO,
            'Estado': hoja.ESTADO,
            'Regional': hoja.REGIONAL,
            'Código Inscripción': hoja.CODIGO_INSCRIPCION,
            'Programa Académico': hoja.CODIPROGACAD,
            'Año Académico': hoja.ANNOPERIACAD,
            'Colegio': hoja.COLEGIO,
            'Estrato': hoja.ESTRATO,
            'Tipo Medio': hoja.TIPO_MEDIO
        }));

        const ws = XLSX.utils.json_to_sheet(datosExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Hojas de Vida');

        const fecha = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `hojas_vida_${fecha}.xlsx`);

        Swal.fire({
            title: '¡Exportación Exitosa!',
            text: `Se han exportado ${datosExport.length} registros`,
            icon: 'success',
            confirmButtonText: 'Entendido'
        });
    }

    getEstadoBadgeClass(estado: string): string {
        switch (estado?.toLowerCase()) {
            case 'activo':
                return 'bg-success';
            case 'inactivo':
                return 'bg-danger';
            case 'suspendido':
                return 'bg-warning';
            default:
                return 'bg-secondary';
        }
    }
}