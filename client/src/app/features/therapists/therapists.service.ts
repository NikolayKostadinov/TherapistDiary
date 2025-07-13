import { Injectable } from '@angular/core';
import { baseUrl, therapistsUrl } from '../../common/constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TherapistDetailsModel, TherapistListModel } from './models';

@Injectable({
    providedIn: 'root'
})
export class TherapistsService {

    private apiUrl = `${baseUrl}/${therapistsUrl}`;

    constructor(private readonly httpClient: HttpClient) { }

    getAllTherapists(): Observable<TherapistListModel[]> {
        return this.httpClient.get<TherapistListModel[]>(this.apiUrl);
    }

    getTherapist(userId: number | string): Observable<TherapistDetailsModel> {
        return this.httpClient.get<TherapistDetailsModel>(`${this.apiUrl}/${userId}`);
    }
}
