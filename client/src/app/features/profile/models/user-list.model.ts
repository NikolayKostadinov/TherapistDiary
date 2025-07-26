export interface UserListModel {
    id: string;
    email: string;
    userName: string;
    firstName: string;
    midName: string | null;
    lastName: string;
    fullName: string;
    phoneNumber: string;
    specialty?: string | null;
    biography: string | null;
    profilePictureUrl: string | null;
    roles: { id: string, name: string }[];
    rolesView: string;
}