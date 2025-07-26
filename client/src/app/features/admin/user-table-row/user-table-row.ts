import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserListModel } from '../../profile/models/user-list.model';

@Component({
    selector: 'tr[app-user-table-row]',
    imports: [],
    templateUrl: './user-table-row.html',
    styleUrl: './user-table-row.css'
})
export class UserTableRow {
    @Input() index!: number;
    @Input() user!: UserListModel;

    @Output() delete = new EventEmitter();

    onDeleteClick() {
        this.delete.emit();
    }
}
