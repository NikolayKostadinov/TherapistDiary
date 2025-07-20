export interface UserInfo {
    id: string;
    email: string;
    username: string;
    fullName: string;
    profilePictureUrl?: string;
    roles: string[];
    isExpired: boolean;
}
