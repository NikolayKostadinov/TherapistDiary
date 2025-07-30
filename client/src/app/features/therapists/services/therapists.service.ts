import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TherapistDetailsModel, TherapistListModel } from '../models';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints';

@Injectable({
    providedIn: 'root'
})
export class TherapistsService {
    private readonly httpClient = inject(HttpClient);


    private apiUrl = `${environment.baseUrl}${API_ENDPOINTS.THERAPISTS}`;

    constructor() { }

    getAllTherapists(): Observable<TherapistListModel[]> {
        return this.httpClient.get<TherapistListModel[]>(this.apiUrl);
    }

    getTherapist(userId: string): Observable<TherapistDetailsModel> {
        return this.httpClient.get<TherapistDetailsModel>(`${this.apiUrl}/${userId}`);
    }
}
