import { Injectable } from '@angular/core';
import { baseUrl, therapyTypesUrl } from '../../../common/constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TherapyTypeListModel } from '../models';

@Injectable({
    providedIn: 'root'
})
export class TherapyTypeService {

    private apiUrl = `${baseUrl}/${therapyTypesUrl}`;

    constructor(private readonly httpClient: HttpClient) { }

    getTherapyTypes(): Observable<TherapyTypeListModel[]> {
        return this.httpClient.get<TherapyTypeListModel[]>(this.apiUrl);
    }
}
