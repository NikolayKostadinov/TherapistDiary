import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TherapistDetailsModel, TherapistListModel } from '../models';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../common/api-endpoints';

@Injectable({
    providedIn: 'root'
})
export class TherapistsService {

    private apiUrl = `${environment.baseUrl}${API_ENDPOINTS.THERAPISTS}`;

    constructor(private readonly httpClient: HttpClient) { }

    getAllTherapists(): Observable<TherapistListModel[]> {
        return this.httpClient.get<TherapistListModel[]>(this.apiUrl);
    }

    getTherapist(userId: string): Observable<TherapistDetailsModel> {
        return this.httpClient.get<TherapistDetailsModel>(`${this.apiUrl}/${userId}`);
    }
}
