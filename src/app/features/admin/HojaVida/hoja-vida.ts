import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { RegisterHojaVidaService } from './hoja.service';

@Component({
    selector: 'app-hoja-vida',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './hoja-vida.html',
    styleUrls: ['./hoja-vida.css']
})
export class HojaVida {
    form: FormGroup;
    submitted = false;

    // Variable para controlar las pestañas
    activeTab = 'individual';

    // Variables para carga masiva
    selectedFile: File | null = null;
    isProcessing = false;
    uploadResults: any[] = [];
    showResults = false;

    // Variables para previsualización
    previewData: any[] = [];
    showPreview = false;
    validationErrors: any[] = [];

    // Variables para resultados del procesamiento
    successfulRecords: any[] = [];
    duplicateRecords: any[] = [];
    processingMessage = '';
    hasErrors = false;

    // Para usar Math en el template
    Math = Math;

    // Variables para consulta de hojas de vida
    hojasVidaExistentes: any[] = [];
    hojasVidaFiltradas: any[] = [];
    isLoadingConsulta = false;
    searchTerm = '';
    currentPage = 1;
    itemsPerPage = 10;
    totalItems = 0;

    // Listas para selects
    generos = ['Masculino', 'Femenino', 'Otro'];
    estados = ['Activo', 'Pendiente', 'Rechazado', 'Admitido'];
    estratos = ['1', '2', '3', '4', '5', '6'];
    tiposMedio = ['Radio', 'TV', 'Web', 'Prensa', 'Redes Sociales', 'Referido'];
    gruposMinoritarios = ['Ninguno', 'Étnico', 'Indígena', 'Afrodescendiente', 'ROM', 'Otro'];
    regionales = ['Regional Oriente', 'Regional Caribe', 'Regional Centro', 'Regional Occidente', 'Regional Sur'];

    constructor(
        private fb: FormBuilder,
        private hojaVidaService: RegisterHojaVidaService
    ) {
        this.form = this.fb.group({

            pkeyHojaVida: ['', [Validators.required]],
            pkeyAspirant: ['', [Validators.required]],
            codiProgAcad: ['', [Validators.required]],
            annoPeriacad: [new Date().getFullYear(), [Validators.required, Validators.min(2020), Validators.max(2030)]],
            numePeriacad: ['1', [Validators.required]],
            codigoInscripcion: ['', [Validators.required]],
            documento: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\-\.]+$/)]],
            nombre: ['', [Validators.required, Validators.maxLength(100)]],
            primerApellido: ['', [Validators.required, Validators.maxLength(50)]],
            segundoApellido: ['', [Validators.maxLength(50)]],
            edad: ['', [Validators.required, Validators.min(16), Validators.max(35)]],
            genero: ['Masculino', [Validators.required]],
            fechNacimiento: ['', [Validators.required]],
            correo: ['', [Validators.required, Validators.email]],
            telefono: ['', [Validators.pattern(/^\d{7,12}$/)]],
            celular: ['', [Validators.required, Validators.pattern(/^\d{7,12}$/)]],
            direccion: ['', [Validators.required, Validators.maxLength(200)]],
            ciudad: ['', [Validators.required]],
            estado: ['Activo', [Validators.required]],
            departamento: ['', [Validators.required]],
            regional: ['', [Validators.required]],
            complementaria1: ['', [Validators.maxLength(200)]],
            complementaria2: ['', [Validators.maxLength(200)]],
            fechaInscripcion: [new Date().toISOString().split('T')[0], [Validators.required]],
            grupMino: ['Ninguno'],
            estrato: ['3', [Validators.required]],
            tipoMedio: ['Web', [Validators.required]],
            colegio: ['', [Validators.required, Validators.maxLength(150)]]
        });
    }

    get f() { return this.form.controls; }

    // Método para cambiar de pestaña
    setActiveTab(tab: string): void {
        this.activeTab = tab;
        
        // Si se selecciona el tab de consulta, cargar las hojas de vida
        if (tab === 'consulta') {
            this.consultarHojasVida();
        }
    }

    // Envío individual
    submit(): void {
        this.submitted = true;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const hojaVida = {
            PKEYHOJAVIDA: this.f['pkeyHojaVida'].value,
            PKEYASPIRANT: this.f['pkeyAspirant'].value,
            CODIPROGACAD: this.f['codiProgAcad'].value,
            ANNOPERIACAD: this.f['annoPeriacad'].value,
            NUMEPERIACAD: this.f['numePeriacad'].value,
            CODIGO_INSCRIPCION: this.f['codigoInscripcion'].value,
            DOCUMENTO: this.f['documento'].value,
            NOMBRE: this.f['nombre'].value,
            PRIMER_APELLIDO: this.f['primerApellido'].value,
            SEGUNDO_APELLIDO: this.f['segundoApellido'].value,
            EDAD: this.f['edad'].value,
            GENERO: this.f['genero'].value,
            FECH_NACIMIENTO: this.f['fechNacimiento'].value,
            CORREO: this.f['correo'].value,
            TELEFONO: this.f['telefono'].value,
            CELULAR: this.f['celular'].value,
            DIRECCION: this.f['direccion'].value,
            CIUDAD: this.f['ciudad'].value,
            ESTADO: this.f['estado'].value,
            DEPARTAMENTO: this.f['departamento'].value,
            REGIONAL: this.f['regional'].value,
            COMPLEMENTARIA_1: this.f['complementaria1'].value,
            COMPLEMENTARIA_2: this.f['complementaria2'].value,
            FECHA_INSCRIPCION: this.f['fechaInscripcion'].value,
            GRUP_MINO: this.f['grupMino'].value,
            ESTRATO: this.f['estrato'].value,
            TIPO_MEDIO: this.f['tipoMedio'].value,
            COLEGIO: this.f['colegio'].value
        };

        // Validar antes de enviar
        const validation = this.hojaVidaService.validateHojaVida(hojaVida);
        if (!validation.isValid) {
            Swal.fire({
                icon: 'error',
                title: 'Errores de validación',
                html: validation.errors.join('<br>')
            });
            return;
        }

        // Enviar al servicio
        this.hojaVidaService.register(hojaVida).subscribe({
            next: (response) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Hoja de vida registrada correctamente'
                });
                this.limpiar();
            },
            error: (error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al registrar la hoja de vida: ' + (error.error?.message || error.message)
                });
            }
        });
    }

    // Procesar archivo Excel/CSV para previsualización
    processExcelFile(): void {
        if (!this.selectedFile) {
            Swal.fire({
                icon: 'warning',
                title: 'No hay archivo',
                text: 'Por favor selecciona un archivo Excel o CSV primero'
            });
            return;
        }

        this.isProcessing = true;
        const reader = new FileReader();

        reader.onload = (e: any) => {
            try {
                let jsonData: any[];

                // Verificar si es un archivo CSV o Excel
                if (this.selectedFile!.name.toLowerCase().endsWith('.csv')) {
                    // Procesar como CSV
                    const csvText = e.target.result as string;
                    // Remover BOM si existe
                    const cleanText = csvText.replace(/^\uFEFF/, '');
                    const lines = cleanText.split('\n').filter(line => line.trim() !== '');
                    jsonData = lines.map(line => line.split(';').map(cell => cell.trim()));
                } else {
                    // Procesar como Excel
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                }

                if (jsonData.length < 2) {
                    throw new Error('El archivo debe contener al menos una fila de datos además de los encabezados');
                }

                const headers = jsonData[0] as string[];
                const expectedHeaders = [
                    'PKEYHOJAVIDA', 'PKEYASPIRANT', 'CODIPROGACAD', 'ANNOPERIACAD', 'NUMEPERIACAD',
                    'CODIGO_INSCRIPCION', 'DOCUMENTO', 'NOMBRE', 'PRIMER_APELLIDO', 'SEGUNDO_APELLIDO',
                    'EDAD', 'GENERO', 'FECH_NACIMIENTO', 'CORREO', 'TELEFONO', 'CELULAR',
                    'DIRECCION', 'CIUDAD', 'ESTADO', 'DEPARTAMENTO', 'REGIONAL',
                    'COMPLEMENTARIA_1', 'COMPLEMENTARIA_2', 'FECHA_INSCRIPCION', 'GRUP_MINO',
                    'ESTRATO', 'TIPO_MEDIO', 'COLEGIO'
                ];

                // Validar encabezados
                const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
                if (missingHeaders.length > 0) {
                    throw new Error(`Faltan las siguientes columnas: ${missingHeaders.join(', ')}`);
                }

                // Procesar datos
                this.previewData = [];
                this.validationErrors = [];

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i] as any[];
                    const rowData: any = {};

                    headers.forEach((header, index) => {
                        rowData[header] = row[index] || '';
                    });

                    // Validar cada fila
                    const validation = this.hojaVidaService.validateHojaVida(rowData);
                    if (!validation.isValid) {
                        this.validationErrors.push({
                            fila: i + 1,
                            errores: validation.errors,
                            data: rowData
                        });
                    }

                    this.previewData.push({
                        fila: i + 1,
                        data: rowData,
                        isValid: validation.isValid,
                        errors: validation.errors
                    });
                }

                this.showPreview = true;
                this.isProcessing = false;

                if (this.validationErrors.length > 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Errores de validación encontrados',
                        html: `Se encontraron ${this.validationErrors.length} filas con errores. Revisa la previsualización para más detalles.`,
                        confirmButtonText: 'Revisar'
                    });
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Archivo válido',
                        text: `${this.previewData.length} registros listos para procesar`,
                        confirmButtonText: 'Continuar'
                    });
                }

            } catch (error: any) {
                this.isProcessing = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Error al procesar archivo',
                    text: error.message || 'Error desconocido al procesar el archivo'
                });
            }
        };

        // Leer el archivo según su tipo
        if (this.selectedFile.name.toLowerCase().endsWith('.csv')) {
            reader.readAsText(this.selectedFile, 'UTF-8');
        } else {
            reader.readAsArrayBuffer(this.selectedFile);
        }
    }

    // Confirmar y enviar datos masivos
    confirmBulkSave(): void {
        const validRecords = this.previewData.filter(item => item.isValid);

        if (validRecords.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'No hay registros válidos',
                text: 'Corrige los errores antes de continuar'
            });
            return;
        }

        Swal.fire({
            title: '¿Confirmar guardado masivo?',
            html: `Se guardarán ${validRecords.length} registros válidos.<br>Los registros con errores serán omitidos.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.saveBulkData(validRecords);
            }
        });
    }

    // Guardar datos masivos
    private saveBulkData(validRecords: any[]): void {
        this.isProcessing = true;
        const hojasVida = validRecords.map(record => record.data);

        this.hojaVidaService.registerBulk(hojasVida).subscribe({
            next: (response) => {
                this.isProcessing = false;
                this.hasErrors = false;
                
                // Procesar respuesta exitosa
                this.successfulRecords = response.response?.hojas_vida || [];
                this.duplicateRecords = [];
                this.processingMessage = response.response?.mensaje || 'Procesamiento completado';
                
                this.showResults = true;
                this.showPreview = false;

                Swal.fire({
                    icon: 'success',
                    title: 'Carga masiva completada',
                    text: this.processingMessage
                });
            },
            error: (error) => {
                this.isProcessing = false;
                
                // Verificar si es error de documentos duplicados (409)
                if (error.status === 409 && error.error?.response) {
                    this.hasErrors = true;
                    this.successfulRecords = [];
                    this.duplicateRecords = error.error.response.documentos_duplicados || [];
                    this.processingMessage = error.error.response.mensaje || 'Se encontraron documentos duplicados';
                    
                    this.showResults = true;
                    this.showPreview = false;

                    Swal.fire({
                        icon: 'warning',
                        title: 'Documentos duplicados encontrados',
                        text: this.processingMessage,
                        confirmButtonText: 'Ver detalles'
                    });
                } else {
                    // Otros errores
                    Swal.fire({
                        icon: 'error',
                        title: 'Error en carga masiva',
                        text: 'Error al procesar los registros: ' + (error.error?.message || error.message)
                    });
                }
            }
        });
    }

    // Cancelar previsualización
    cancelPreview(): void {
        this.showPreview = false;
        this.previewData = [];
        this.validationErrors = [];
    }

    limpiar(): void {
        this.form.reset();
        this.submitted = false;
        this.form.patchValue({
            annoPeriacad: new Date().getFullYear(),
            numePeriacad: '1',
            genero: 'Masculino',
            estado: 'Activo',
            grupMino: 'Ninguno',
            estrato: '3',
            tipoMedio: 'Web',
            fechaInscripcion: new Date().toISOString().split('T')[0]
        });
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel';
            const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');

            if (isExcel || isCsv) {
                this.selectedFile = file;
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Archivo inválido',
                    text: 'Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv)'
                });
                event.target.value = '';
            }
        }
    }

    downloadTemplate(): void {
        const headers = [
            'PKEYHOJAVIDA', 'PKEYASPIRANT', 'CODIPROGACAD', 'ANNOPERIACAD', 'NUMEPERIACAD',
            'CODIGO_INSCRIPCION', 'DOCUMENTO', 'NOMBRE', 'PRIMER_APELLIDO', 'SEGUNDO_APELLIDO',
            'EDAD', 'GENERO', 'FECH_NACIMIENTO', 'CORREO', 'TELEFONO', 'CELULAR',
            'DIRECCION', 'CIUDAD', 'ESTADO', 'DEPARTAMENTO', 'REGIONAL',
            'COMPLEMENTARIA_1', 'COMPLEMENTARIA_2', 'FECHA_INSCRIPCION', 'GRUP_MINO',
            'ESTRATO', 'TIPO_MEDIO', 'COLEGIO'
        ];

        // Crear un nuevo libro de trabajo
        const workbook = XLSX.utils.book_new();

        // Crear una hoja con solo los encabezados
        const worksheet = XLSX.utils.aoa_to_sheet([headers]);

        // Agregar la hoja al libro
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');

        // Generar el archivo Excel y descargarlo
        XLSX.writeFile(workbook, 'plantilla_hoja_vida.xlsx');
    }

    clearResults(): void {
        this.uploadResults = [];
        this.showResults = false;
        this.previewData = [];
        this.showPreview = false;
        this.validationErrors = [];
        this.selectedFile = null;
        
        // Limpiar nuevas variables de resultados
        this.successfulRecords = [];
        this.duplicateRecords = [];
        this.processingMessage = '';
        this.hasErrors = false;

        // Limpiar el input de archivo
        const fileInput = document.getElementById('excelFile') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }
    // Mostrar detalles de una fila específica
    showRowDetails(item: any): void {
        const data = item.data;
        const errors = item.errors || [];

        let html = '<div class="text-start">';
        html += '<h6>Datos de la fila ' + item.fila + ':</h6>';
        html += '<div class="row">';

        // Mostrar todos los campos
        const fields = [
            { key: 'PKEYHOJAVIDA', label: 'ID Hoja de Vida' },
            { key: 'PKEYASPIRANT', label: 'ID Aspirante' },
            { key: 'CODIPROGACAD', label: 'Programa Académico' },
            { key: 'DOCUMENTO', label: 'Documento' },
            { key: 'NOMBRE', label: 'Nombre' },
            { key: 'PRIMER_APELLIDO', label: 'Primer Apellido' },
            { key: 'SEGUNDO_APELLIDO', label: 'Segundo Apellido' },
            { key: 'EDAD', label: 'Edad' },
            { key: 'GENERO', label: 'Género' },
            { key: 'CORREO', label: 'Correo' },
            { key: 'CELULAR', label: 'Celular' },
            { key: 'CIUDAD', label: 'Ciudad' },
            { key: 'DEPARTAMENTO', label: 'Departamento' }
        ];

        fields.forEach(field => {
            const value = data[field.key] || 'N/A';
            const hasError = errors.some((error: string) => error.includes(field.label));
            const colorClass = hasError ? 'text-danger' : 'text-success';

            html += `<div class="col-md-6 mb-2">`;
            html += `<strong>${field.label}:</strong> `;
            html += `<span class="${colorClass}">${value}</span>`;
            html += `</div>`;
        });

        html += '</div>';

        if (errors.length > 0) {
            html += '<hr><h6 class="text-danger">Errores encontrados:</h6>';
            html += '<ul class="text-danger">';
            errors.forEach((error: string) => {
                html += `<li>${error}</li>`;
            });
            html += '</ul>';
        }

        html += '</div>';

        Swal.fire({
            title: item.isValid ? 'Registro Válido' : 'Registro con Errores',
            html: html,
            icon: item.isValid ? 'success' : 'error',
            width: '800px',
            confirmButtonText: 'Cerrar'
        });
    }

    // Métodos para consulta de hojas de vida
    consultarHojasVida(): void {
        this.isLoadingConsulta = true;
        
        this.hojaVidaService.consultarHojasVida().subscribe({
            next: (response) => {
                this.isLoadingConsulta = false;
                if (response.error === 0) {
                    this.hojasVidaExistentes = response.response.hojas_vida || [];
                    this.totalItems = response.response.total_registros || 0;
                    this.filtrarHojasVida();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al consultar las hojas de vida'
                    });
                }
            },
            error: (error) => {
                this.isLoadingConsulta = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al consultar las hojas de vida: ' + (error.error?.message || error.message)
                });
            }
        });
    }

    // Filtrar hojas de vida por término de búsqueda
    filtrarHojasVida(): void {
        if (!this.searchTerm.trim()) {
            this.hojasVidaFiltradas = [...this.hojasVidaExistentes];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.hojasVidaFiltradas = this.hojasVidaExistentes.filter(hoja => 
                hoja.DOCUMENTO?.toString().toLowerCase().includes(term) ||
                hoja.NOMBRE?.toLowerCase().includes(term) ||
                hoja.PRIMER_APELLIDO?.toLowerCase().includes(term) ||
                hoja.CORREO?.toLowerCase().includes(term) ||
                hoja.CIUDAD?.toLowerCase().includes(term)
            );
        }
        this.currentPage = 1; // Resetear a la primera página
    }

    // Obtener hojas de vida para la página actual
    get hojasVidaPaginadas(): any[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.hojasVidaFiltradas.slice(startIndex, endIndex);
    }

    // Obtener número total de páginas
    get totalPages(): number {
        return Math.ceil(this.hojasVidaFiltradas.length / this.itemsPerPage);
    }

    // Cambiar página
    cambiarPagina(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    // Obtener array de páginas para mostrar en el paginador
    get paginasArray(): number[] {
        const pages = [];
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
        return pages;
    }

    // Formatear fecha
    formatearFecha(fecha: string): string {
        if (!fecha) return 'N/A';
        try {
            const date = new Date(fecha);
            return date.toLocaleDateString('es-ES');
        } catch {
            return fecha;
        }
    }

    // Obtener clase CSS para el badge según el estado
    getBadgeClass(estado: string): string {
        if (!estado) return 'bg-secondary';
        
        const estadoNormalizado = estado.toString().trim().toUpperCase();
        
        switch (estadoNormalizado) {
            case 'ACTIVO':
                return 'bg-success';
            case 'PENDIENTE':
                return 'bg-warning';
            case 'RECHAZADO':
                return 'bg-danger';
            case 'ADMITIDO':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    }

    // Ver detalle completo de una hoja de vida
    verDetalleHoja(hoja: any): void {
        const html = `
            <div class="text-start">
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="text-primary">Información Personal</h6>
                        <p><strong>Documento:</strong> ${hoja.DOCUMENTO || 'N/A'}</p>
                        <p><strong>Nombre:</strong> ${hoja.NOMBRE || 'N/A'} ${hoja.PRIMER_APELLIDO || ''} ${hoja.SEGUNDO_APELLIDO || ''}</p>
                        <p><strong>Edad:</strong> ${hoja.EDAD || 'N/A'}</p>
                        <p><strong>Género:</strong> ${hoja.GENERO || 'N/A'}</p>
                        <p><strong>Fecha Nacimiento:</strong> ${hoja.FECH_NACIMIENTO || 'N/A'}</p>
                        
                        <h6 class="text-primary mt-3">Contacto</h6>
                        <p><strong>Correo:</strong> ${hoja.CORREO || 'N/A'}</p>
                        <p><strong>Teléfono:</strong> ${hoja.TELEFONO || 'N/A'}</p>
                        <p><strong>Celular:</strong> ${hoja.CELULAR || 'N/A'}</p>
                        <p><strong>Dirección:</strong> ${hoja.DIRECCION || 'N/A'}</p>
                    </div>
                    <div class="col-md-6">
                        <h6 class="text-primary">Información Académica</h6>
                        <p><strong>Código Programa:</strong> ${hoja.CODIPROGACAD || 'N/A'}</p>
                        <p><strong>Año Período:</strong> ${hoja.ANNOPERIACAD || 'N/A'}</p>
                        <p><strong>Número Período:</strong> ${hoja.NUMEPERIACAD || 'N/A'}</p>
                        <p><strong>Código Inscripción:</strong> ${hoja.CODIGO_INSCRIPCION || 'N/A'}</p>
                        <p><strong>Colegio:</strong> ${hoja.COLEGIO || 'N/A'}</p>
                        
                        <h6 class="text-primary mt-3">Ubicación y Estado</h6>
                        <p><strong>Ciudad:</strong> ${hoja.CIUDAD || 'N/A'}</p>
                        <p><strong>Departamento:</strong> ${hoja.DEPARTAMENTO || 'N/A'}</p>
                        <p><strong>Regional:</strong> ${hoja.REGIONAL || 'N/A'}</p>
                        <p><strong>Estado:</strong> <span class="badge ${hoja.ESTADO === 'ACTIVO' ? 'bg-success' : hoja.ESTADO === 'PENDIENTE' ? 'bg-warning' : 'bg-danger'}">${hoja.ESTADO || 'N/A'}</span></p>
                        <p><strong>Estrato:</strong> ${hoja.ESTRATO || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="row mt-3">
                    <div class="col-12">
                        <h6 class="text-primary">Información Adicional</h6>
                        <p><strong>Grupo Minoritario:</strong> ${hoja.GRUP_MINO || 'N/A'}</p>
                        <p><strong>Tipo Medio:</strong> ${hoja.TIPO_MEDIO || 'N/A'}</p>
                        <p><strong>Complementaria 1:</strong> ${hoja.COMPLEMENTARIA_1 || 'N/A'}</p>
                        <p><strong>Complementaria 2:</strong> ${hoja.COMPLEMENTARIA_2 || 'N/A'}</p>
                        <p><strong>Fecha Inscripción:</strong> ${hoja.FECHA_INSCRIPCION || 'N/A'}</p>
                        <p><strong>Fecha Creación:</strong> ${this.formatearFecha(hoja.createdAt)}</p>
                        <p><strong>Última Actualización:</strong> ${this.formatearFecha(hoja.updatedAt)}</p>
                    </div>
                </div>
            </div>
        `;

        Swal.fire({
            title: `Detalle de Hoja de Vida - ${hoja.NOMBRE} ${hoja.PRIMER_APELLIDO}`,
            html: html,
            icon: 'info',
            width: '900px',
            confirmButtonText: 'Cerrar',
            customClass: {
                popup: 'text-start'
            }
        });
    }
}