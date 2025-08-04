import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS, PagedFilteredRequest, PagedResult } from '../../../common';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AppointmentCreateModel, AppointmentTimeModel, MyAppointmentModel, TherapistAppointmentModel } from '../models';


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
            map(response => response.body || [])
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

    deleteAppointment(appointmentId: string): Observable<void> {
        return this.httpClient.delete<void>(
            `${this.apiUrl}/${appointmentId}`,
            { observe: 'response' }
        ).pipe(
            map(() => void 0)
        );
    }

    getMyAppointments(patientId: string, parameters: PagedFilteredRequest): Observable<HttpResponse<PagedResult<any>>> {

        let params = this.initializeQueryParams(parameters);
        params = params.set('patientId', patientId);

        const appointmentUrl = `${environment.baseUrl}${API_ENDPOINTS.APPOINTMENTS.BY_PATIENT}`;
        return this.httpClient.get<PagedResult<MyAppointmentModel>>(appointmentUrl,
            {
                params: params,
                observe: 'response'
            }
        );
    }

    getTherapistAppointments( therapistId: string, parameters: PagedFilteredRequest): Observable<HttpResponse<PagedResult<any>>> {

        let params = this.initializeQueryParams(parameters);
        params = params.set('therapistId', therapistId);

        const therapistAppointmentsUrl = `${environment.baseUrl}${API_ENDPOINTS.APPOINTMENTS.BY_THERAPIST}`;
        return this.httpClient.get<PagedResult<TherapistAppointmentModel>>(therapistAppointmentsUrl,
            {
                params: params,
                observe: 'response'
            }
        );
    }

    private initializeQueryParams(parameters: PagedFilteredRequest): HttpParams {
        let params = new HttpParams()
            .set('pageNumber', parameters.pageNumber.toString())
            .set('pageSize', parameters.pageSize?.toString() || '10');

        if (parameters.searchTerm) {
            params = params.set('searchTerm', parameters.searchTerm);
        }

        if (parameters.sortBy) {
            params = params.set('sortBy', parameters.sortBy);
        }

        if (parameters.sortDescending !== null) {
            params = params.set('sortDescending', parameters.sortDescending ?? false);
        }
        return params;
    }

    updateAppointmentNotes(appointmentId: string, notes: string): Observable<void> {
        return this.httpClient.patch<void>(
            `${this.apiUrl}/${appointmentId}/notes`,
            { notes },
            { observe: 'response' }
        ).pipe(
            map(() => void 0)
        );
        // Глобалният interceptor ще обработи грешките автоматично
    }

    updateTherapistNotes(appointmentId: string, therapistNotes: string): Observable<void> {
        return this.httpClient.patch<void>(
            `${this.apiUrl}/${appointmentId}/therapist-notes`,
            { therapistNotes },
            { observe: 'response' }
        ).pipe(
            map(() => void 0)
        );
        // Глобалният interceptор ще обработи грешките автоматично
    }
}


