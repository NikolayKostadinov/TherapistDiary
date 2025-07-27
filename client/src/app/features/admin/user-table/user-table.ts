import { AfterViewInit, Component, OnInit, signal, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserManagementService } from '../services/user-management.service';
import { ApiError, ConfirmationModal, PagedResult, PagerModel, Utils } from '../../../common';
import { UserListModel } from '../../profile/models/user-list.model';
import { ToasterService, Spinner } from '../../../layout';
import { UserTableRow } from "../user-table-row/user-table-row";
import { Pager } from '../../../layout/pager/pager';

@Component({
    selector: 'app-user-table',
    imports: [ReactiveFormsModule, CommonModule, ConfirmationModal, Spinner, UserTableRow, Pager],
    templateUrl: './user-table.html',
    styleUrl: './user-table.css'
})
export class UserTable implements OnInit, AfterViewInit {
    protected pageSizes = [2, 10, 50, 100];
    protected pageSize = 2;
    protected usersPagedList: Signal<PagedResult<UserListModel> | null>;
    protected usersPager: Signal<PagerModel | null>;
    protected clickedUser = signal<UserListModel | null>(null);
    protected showDeleteModal = signal(false);
    protected isLoading: Signal<boolean>;
    protected pageOffset: Signal<number>;

    constructor(
        private readonly userManagementServise: UserManagementService,
        private readonly toaster: ToasterService
    ) {
        this.usersPagedList = this.userManagementServise.usersPagedList;
        this.usersPager = computed(() => {
            const pagedList = this.usersPagedList();
            console.log('Computing usersPager with pagedList:', pagedList);

            if (!pagedList) return null;

            const pagerModel = {
                totalCount: pagedList.totalCount,
                page: pagedList.page,
                pageSize: pagedList.pageSize,
                totalPages: pagedList.totalPages,
                hasNextPage: pagedList.hasNextPage,
                hasPreviousPage: pagedList.hasPreviousPage
            } as PagerModel;

            console.log('Computed pagerModel:', pagerModel);
            return pagerModel;
        });
        this.pageOffset = computed(() => {
            const currentPage = this.usersPager()?.page ?? 1;
            const currentPageSize = this.usersPagedList()?.pageSize ?? 10;
            return (currentPage - 1) * currentPageSize;
        });
        this.isLoading = this.userManagementServise.isLoading;
    }

    ngAfterViewInit(): void {
        console.log('UserTable initialized');
        console.log('UsersPagedList:', this.usersPagedList());
        console.log('UsersPager:', this.usersPager());
        console.log('IsLoading:', this.isLoading());
    }

    ngOnInit(): void {
        this.userManagementServise.loadUsers(1, 2); // Променям от 2 на 10
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

    onPageSizeChange(pageSize: number): void {
        console.log("onPageSizeChange: ", pageSize);
        // Зареждаме първата страница с новия размер
        this.userManagementServise.loadUsers(1, pageSize);
    }

    onPageChange(page: number): void {
        console.log("onPageChange: ", page);
        // Зареждаме новата страница със същия размер
        const currentPageSize = this.usersPagedList()?.pageSize ?? 10;
        this.userManagementServise.loadUsers(page, currentPageSize);
    }
}
