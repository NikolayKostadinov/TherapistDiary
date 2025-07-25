import { Injectable } from '@angular/core';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase.config';
import { from, Observable, switchMap } from 'rxjs';
import { API_ENDPOINTS } from '../constants';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    constructor() { }

    uploadProfileImage(file: File, userId: string): Observable<string> {
        const imageRef = ref(storage, `${API_ENDPOINTS.FIREBASE.UPLOAD_PROFILE_IMAGE}/${userId}`);

        return from(uploadBytes(imageRef, file))
            .pipe(switchMap(snapshot =>
                from(getDownloadURL(snapshot.ref))
            ));
    }
}