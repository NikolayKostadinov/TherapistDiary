import { Injectable } from '@angular/core';
import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';
import { storage } from './firebase.config';
import { from, Observable, switchMap, catchError, of, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../api-endpoints';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    constructor() { }

    uploadProfileImage(file: File, userId: string): Observable<string> {
        // Extract file extension from original filename
        const firebaseProfileImagePath = this.createProfileImagePath(file, userId);
        const imageRef = ref(storage, firebaseProfileImagePath);

        // Check if file exists and handle accordingly
        return from(getMetadata(imageRef)).pipe(
            switchMap(() => {
                // File exists, delete it first
                console.log('Existing file found, deleting...');
                return from(deleteObject(imageRef));
            }),
            catchError(() => {
                // File doesn't exist, continue
                console.log('No existing file found, proceeding with upload...');
                return of(void 0);
            }),
            switchMap(() => from(uploadBytes(imageRef, file))),
            switchMap(snapshot => from(getDownloadURL(snapshot.ref))),
            catchError(error => {
                console.error('Error uploading profile image:', error);
                return throwError(() => new Error('Failed to upload profile image'));
            })
        );
    }

    private createProfileImagePath(file: File, userId: string) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const profileImageName = fileExtension ? `${userId}.${fileExtension}` : userId;
        const firebaseProfileImagePath = `${API_ENDPOINTS.FIREBASE.UPLOAD_PROFILE_IMAGE}/${profileImageName}`;
        return firebaseProfileImagePath;
    }
}
