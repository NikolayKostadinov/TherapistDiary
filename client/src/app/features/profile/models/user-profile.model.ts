export interface UserProfileModel {
    id: string;
    userName: string;
    email: string;
    firstName: string;
    midName: string | null;
    lastName: string;
    fullName: string;
    phoneNumber: string;
    specialty?: string | null;
    biography: string | null;
    profilePictureUrl: string | null;
}