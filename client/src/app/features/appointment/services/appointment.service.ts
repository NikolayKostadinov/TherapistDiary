import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS, Utils } from '../../../common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AppointmentTimeModel, AppointmentCreateModel } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.baseUrl}${API_ENDPOINTS.APPOINTMENTS}`;
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
}


