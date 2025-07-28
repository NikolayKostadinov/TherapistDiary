import { UserListModel } from "../../profile/models/user-list.model";

export interface ToggleRoleModel {
    user: UserListModel;
    role: "Therapist" | "Administrator";
}
