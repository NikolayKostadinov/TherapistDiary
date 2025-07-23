export interface UserEditProfileModel {
    id: string;
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