import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class RegistroIpsService {
    private apiUrl = 'http://localhost:3000/api/ips/crearIps';

    constructor(private http: HttpClient) { }

    registrarIps(ipsData: any): Observable<any> {
        const token = localStorage.getItem('token') ?? '';
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
        
        return this.http.post<any>(this.apiUrl, ipsData, { headers }).pipe(
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