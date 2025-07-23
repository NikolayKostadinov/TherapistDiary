export interface UserInfo {
    id: string;
    email: string;
    userName: string;
    fullName: string;
    profilePictureUrl?: string;
    roles: string[];
    isExpired: boolean;
}
