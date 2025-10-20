import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class IpsGestionService {
    private apiUrl = 'http://localhost:3000/api/hojas-vida';

    constructor(private http: HttpClient) { }

    consultarHojasVida(): Observable<any> {
        const token = localStorage.getItem('token') ?? '';
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
        
        return this.http.get<any>(`${this.apiUrl}/consultar`, { headers }).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.error && typeof error.error === 'object' && error.error.hasOwnProperty('error')) {
                    return new Observable(observer => {
                        observer.next(error.error);
                        observer.complete();
                    });
                }
                return throwError(() => error);
            })
        );
    }

    agendarCita(datosAgendamiento: any): Observable<any> {
        const token = localStorage.getItem('token') ?? '';
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
        

        const agendarUrl = 'http://localhost:3000/api/hojas-vida/agendar';
        
        return this.http.put<any>(agendarUrl, datosAgendamiento, { headers }).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.error && typeof error.error === 'object' && error.error.hasOwnProperty('error')) {
                    return new Observable(observer => {
                        observer.next(error.error);
                        observer.complete();
                    });
                }
                return throwError(() => error);
            })
        );
    }
}