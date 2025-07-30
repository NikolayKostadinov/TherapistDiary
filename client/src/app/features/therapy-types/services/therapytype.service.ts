import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TherapyTypeListModel } from '../models';
import { API_ENDPOINTS } from '../../../common/constants/api-endpoints';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TherapyTypeService {
    private readonly httpClient = inject(HttpClient);


    private apiUrl = `${environment.baseUrl}${API_ENDPOINTS.THERAPY_TYPES}`;

    constructor() { }

    getTherapyTypes(): Observable<TherapyTypeListModel[]> {
        return this.httpClient.get<TherapyTypeListModel[]>(this.apiUrl);
    }
}
