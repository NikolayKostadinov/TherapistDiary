import { Injectable } from '@angular/core';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase.config';
import { from, Observable, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    constructor() { }

    uploadProfileImage(file: File, userId: string): Observable<string> {
        const imageRef = ref(storage, `profile-images/${userId}`);

        return from(uploadBytes(imageRef, file))
            .pipe(switchMap(snapshot =>
                from(getDownloadURL(snapshot.ref))
            ));
    }
}