import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TherapyTypeListModel } from '../models';
import { API_ENDPOINTS } from '../../../common/api-endpoints';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TherapyTypeService {

    private apiUrl = `${environment.baseUrl}${API_ENDPOINTS.THERAPY_TYPES}`;

    constructor(private readonly httpClient: HttpClient) { }

    getTherapyTypes(): Observable<TherapyTypeListModel[]> {
        return this.httpClient.get<TherapyTypeListModel[]>(this.apiUrl);
    }
}
