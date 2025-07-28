import { AfterViewInit, Component, OnInit, signal, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagementService } from '../services/user-management.service';
import { ApiError, ConfirmationModal, PagedResult, PagerModel, Utils } from '../../../common';
import { UserListModel } from '../../profile/models/user-list.model';
import { ToasterService } from '../../../layout';
import { UserTableRow } from "../user-table-row/user-table-row";
import { Pager } from '../../../layout/pager/pager';
import { ToggleRoleModel } from '../models/toggle-role.model';

@Component({
    selector: 'app-user-table',
    imports: [CommonModule, ConfirmationModal, UserTableRow, Pager],
    templateUrl: './user-table.html',
    styleUrl: './user-table.css'
})
export class UserTable implements OnInit, AfterViewInit {

    protected pageSizes = [10, 50, 100];
    protected pageSize = 10;
    protected usersPagedList: Signal<PagedResult<UserListModel> | null>;
    protected usersPager: Signal<PagerModel | null>;
    protected clickedUser = signal<UserListModel | null>(null);
    protected showDeleteModal = signal(false);
    protected isLoading: Signal<boolean>;
    protected pageOffset: Signal<number>;

    // Search functionality  
    protected searchTerm = signal<string>('');
    private searchTimeout: any = null;

    // Sorting functionality
    protected sortBy = signal<string | null>(null);
    protected sortDescending = signal<boolean>(false);

    constructor(
        private readonly userManagementServise: UserManagementService,
        private readonly toaster: ToasterService
    ) {
        this.usersPagedList = this.userManagementServise.usersPagedList;
        this.usersPager = computed(() => {
            const pagedList = this.usersPagedList();

            if (!pagedList) return null;

            const pagerModel = {
                totalCount: pagedList.totalCount,
                page: pagedList.page,
                pageSize: pagedList.pageSize,
                totalPages: pagedList.totalPages,
                hasNextPage: pagedList.hasNextPage,
                hasPreviousPage: pagedList.hasPreviousPage
            } as PagerModel;

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
        this.userManagementServise.loadUsers(1, this.pageSize); // Променям от 2 на 10
    }

    onSortColumn(column: string): void {
        if (this.sortBy() === column) {
            if (!this.sortDescending()) {
                // First click: ascending -> descending
                this.sortDescending.set(true);
            } else {
                // Second click: descending -> no sorting
                this.sortBy.set(null);
                this.sortDescending.set(false);
            }
        } else {
            // New column: start with ascending
            this.sortBy.set(column);
            this.sortDescending.set(false);
        }

        // Apply the sort
        this.performSort();
    }

    private performSort(): void {
        const currentPageSize = this.usersPagedList()?.pageSize ?? this.pageSize;
        this.userManagementServise.loadUsers(
            1, // Reset to first page when sorting
            currentPageSize,
            this.searchTerm(),
            this.sortBy(),
            this.sortBy() ? (this.sortDescending() ? 'true' : 'false') : null
        );
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
        // Зареждаме първата страница с новия размер
        this.userManagementServise.loadUsers(1, pageSize, this.searchTerm(), this.sortBy(), this.sortBy() ? (this.sortDescending() ? 'true' : 'false') : null);
    }

    onPageChange(page: number): void {
        console.log("onPageChange: ", page);
        // Зареждаме новата страница със същия размер
        const currentPageSize = this.usersPagedList()?.pageSize ?? 10;
        this.userManagementServise.loadUsers(page, currentPageSize, this.searchTerm(), this.sortBy(), this.sortBy() ? (this.sortDescending() ? 'true' : 'false') : null);
    }


    onClearSearch(): void {
        this.searchTerm.set('');
        const currentPageSize = this.usersPagedList()?.pageSize ?? this.pageSize;
        this.userManagementServise.loadUsers(1, currentPageSize, null, this.sortBy(), this.sortBy() ? (this.sortDescending() ? 'true' : 'false') : null);
    }

    onSearchInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        const value = target.value;

        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Set new timeout for debounced search
        this.searchTimeout = setTimeout(() => {
            this.searchTerm.set(value);
            this.performSearch();
        }, 300);
    }


    onToggleRole($event: ToggleRoleModel): void {
        this.userManagementServise.toggleUserRole($event.user.id, $event.role).subscribe({
            next: () => {
                this.toaster.success(`Ролята на потребителя '${$event.user.fullName}' беше успешно променена на '${$event.role}'`);
            },
            error: (error: ApiError) => {
                const errorDescription = Utils.getGeneralErrorMessage(error);
                this.toaster.error(errorDescription);
            }
        });
    }
    private performSearch(): void {
        // Reset to first page when searching
        const currentPageSize = this.usersPagedList()?.pageSize ?? this.pageSize;
        this.userManagementServise.loadUsers(1, currentPageSize, this.searchTerm(), this.sortBy(), this.sortBy() ? (this.sortDescending() ? 'true' : 'false') : null);
    }

    getSortIcon(column: string): string {
        if (this.sortBy() !== column) {
            return '';
        }
        return this.sortDescending() ? 'fas fa-arrow-up text-primary' : 'fas fa-arrow-down text-primary';
    }

    isSortable(column: string): boolean {
        const sortableColumns = ['firstName', 'midName', 'lastName', 'phoneNumber'];
        return sortableColumns.includes(column);
    }
}
