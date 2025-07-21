export interface RegisterRequest {
    userName: string;
    email: string;
    firstName: string;
    midName?: string | null;
    lastName: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}
