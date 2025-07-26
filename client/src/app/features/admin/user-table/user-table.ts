import { Component, OnInit, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserManagementService } from '../services/user-management.service';
import { ApiError, ConfirmationModal, PagedResult, Utils } from '../../../common';
import { UserListModel } from '../../profile/models/user-list.model';
import { ToasterService, Spinner } from '../../../layout';
import { UserTableRow } from "../user-table-row/user-table-row";

@Component({
    selector: 'app-user-table',
    imports: [ReactiveFormsModule, CommonModule, ConfirmationModal, Spinner, UserTableRow],
    templateUrl: './user-table.html',
    styleUrl: './user-table.css'
})
export class UserTable implements OnInit {
    protected pageSizes = [10, 50, 100];
    protected usersPagedList: Signal<PagedResult<UserListModel> | null>;
    protected clickedUser = signal<UserListModel | null>(null);
    protected showDeleteModal = signal(false);
    protected isLoading: Signal<boolean>;

    constructor(
        private readonly userManagementServise: UserManagementService,
        private readonly toaster: ToasterService
    ) {
        this.usersPagedList = this.userManagementServise.usersPagedList;
        this.isLoading = this.userManagementServise.isLoading;
    }

    ngOnInit(): void {
        this.userManagementServise.loadUsers();
    }

    onDeleteClick(user: UserListModel): void {
        this.clickedUser.set(user);
        this.showDeleteModal.set(true);
    }

    onConfirmDelete(): void {
        this.showDeleteModal.set(false);
        const userId = this.clickedUser()?.id;
        if (userId) {
            this.userManagementServise.deleteProfile(userId).subscribe({
                next: () => {
                    this.toaster.success(`Потребителя '${this.clickedUser()?.fullName}' беше успешно изтрит`);
                },
                error: (error: ApiError) => {
                    const errorDescroption = Utils.getGeneralErrorMessage(error);
                    this.toaster.error(errorDescroption);
                }
            });
        }
    }

    onCancelDelete(): void {
        this.showDeleteModal.set(false);
    }
}
