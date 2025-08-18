import { Component, input, output } from '@angular/core';
import { UserListModel } from '../../profile/models/user-list.model';
import { ToggleRoleModel } from '../models/toggle-role.model';

@Component({
    selector: 'tr[app-user-table-row]',
    imports: [],
    templateUrl: './user-table-row.html',
    styleUrl: './user-table-row.css'
})
export class UserTableRow {
    index = input.required<number>();
    user = input.required<UserListModel>();

    delete = output<void>();
    toggleRole = output<ToggleRoleModel>();

    onDeleteClick() {
        this.delete.emit();
    }

    get isTherapist(): boolean {
        return this.user().roles.some(x => x.name == 'Therapist');
    }

    get isAdministrator(): boolean {
        return this.user().roles.some(x => x.name == 'Administrator');
    }

    onToggleRole(role: "Therapist" | "Administrator"): void {
        this.toggleRole.emit(<ToggleRoleModel>{ user: this.user(), role });
    }
}
