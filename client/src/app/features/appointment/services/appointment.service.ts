import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS, Utils, PagedResult } from '../../../common';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AppointmentTimeModel, AppointmentCreateModel } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    private apiUrl = `${environment.baseUrl}${API_ENDPOINTS.APPOINTMENTS.BASE}`;
    private readonly httpClient = inject(HttpClient);

    constructor() { }

    getAvailableAppointments(therapistId: string, date: string): Observable<AppointmentTimeModel[]> {
        return this.httpClient.get<AppointmentTimeModel[]>(
            `${this.apiUrl}/${therapistId}/${date}`,
            { observe: 'response' }
        ).pipe(
            map(response => response.body || []),
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'наличните часове');
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    createAppointment(appointment: AppointmentCreateModel): Observable<void> {
        return this.httpClient.post<void>(
            this.apiUrl,
            appointment,
            { observe: 'response' }
        ).pipe(
            map(() => void 0),
        );
    }

    getMyAppointments(patientId: string, pageNumber: number, pageSize: number = 10, searchTerm: string | null = null, sortBy: string | null = null, sortDescending: string | null = null): Observable<HttpResponse<PagedResult<any>>> {
        let params = this.initializeQueryParams(pageNumber, pageSize, searchTerm, sortBy, sortDescending);
        params = params.set('patientId', patientId);

        return this.httpClient.get<PagedResult<any>>(`${environment.baseUrl}${API_ENDPOINTS.APPOINTMENTS.BY_PATIENT}`,
            {
                params: params,
                observe: 'response'
            }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'записаните часове');
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    getTherapistAppointments(therapistId: string, pageNumber: number, pageSize: number = 10, searchTerm: string | null = null, sortBy: string | null = null, sortDescending: string | null = null): Observable<HttpResponse<PagedResult<any>>> {
        let params = this.initializeQueryParams(pageNumber, pageSize, searchTerm, sortBy, sortDescending);
        params = params.set('therapistId', therapistId);

        return this.httpClient.get<PagedResult<any>>(`${environment.baseUrl}${API_ENDPOINTS.APPOINTMENTS.BY_THERAPIST}`,
            {
                params: params,
                observe: 'response'
            }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = Utils.getErrorMessage(error, 'записаните часове');
                return throwError(() => new Error(errorMessage));
            })
        );
    }

    private initializeQueryParams(pageNumber: number, pageSize: number, searchTerm: string | null, sortBy: string | null, sortDescending: string | null): HttpParams {
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        if (searchTerm) {
            params = params.set('searchTerm', searchTerm);
        }

        if (sortBy) {
            params = params.set('sortBy', sortBy);
        }

        if (sortDescending !== null) {
            params = params.set('sortDescending', sortDescending);
        }
        return params;
    }
}


