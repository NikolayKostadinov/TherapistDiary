export interface UserInfo {
    id: string;
    email?: string;
    username?: string;
    roles: string[];
    isExpired: boolean;
}
