import { Injectable } from '@angular/core';
import { baseUrl, therapistsUrl } from '../../../common/constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TherapistListModel } from '../models';

@Injectable({
    providedIn: 'root'
})
export class TherapistsService {

    private apiUrl = `${baseUrl}/${therapistsUrl}`;
    constructor(private readonly httpcClient: HttpClient) { }

    getTherapists(limit: number = 5): Observable<TherapistListModel[]> {
        return this.httpcClient.get<TherapistListModel[]>(this.apiUrl);
    }
}
