import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, computed, inject, OnInit, signal, Signal, } from "@angular/core";
import { ApiError, ConfirmationModal, PagedResult, PagerModel, Utils} from "../../../common";
import { ToasterService } from "../../../layout";
import { Pager } from "../../../layout/pager/pager";
import { UserListModel } from "../../profile/models/user-list.model";
import { ToggleRoleModel } from "../models/toggle-role.model";
import { UserManagementService } from "../services/user-management.service";
import { UserTableRow } from "../user-table-row/user-table-row";

@Component({
    selector: "app-user-table",
    imports: [CommonModule, ConfirmationModal, UserTableRow, Pager],
    templateUrl: "./user-table.html",
    styleUrl: "./user-table.css",
})
export class UserTable implements OnInit, AfterViewInit {
    private readonly userManagementServise = inject(UserManagementService);
    private readonly toaster = inject(ToasterService);

    protected pageSizes = [10, 50, 100];
    protected pageSize = 10;
    protected usersPagedList: Signal<PagedResult<UserListModel> | null>;
    protected usersPager: Signal<PagerModel | null>;
    protected clickedUser = signal<UserListModel | null>(null);
    protected showDeleteModal = signal(false);
    protected isLoading: Signal<boolean>;
    protected pageOffset: Signal<number>;

    // Search functionality
    protected searchTerm = signal<string>("");
    private searchTimeout: any = null;

    // Sorting functionality
    protected sortBy = signal<string | null>(null);
    protected sortDescending = signal<boolean>(false);

    constructor() {
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
                hasPreviousPage: pagedList.hasPreviousPage,
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
        // Initialization complete
    }

    ngOnInit(): void {
        this.userManagementServise.loadUsers(1, this.pageSize); // Променям от 2 на 10
    }

    onSortColumn(column: string): void {
        if (this.sortBy() === column) {
            const current = this.sortDescending();
            this.toggleSortOrder(current);
        } else {
            this.sortBy.set(column);
            this.sortDescending.set(false);
        }
        this.performSort();
    }

    private toggleSortOrder(current: boolean): void {
        if (!current) {
            // Currently ascending -> change to descending
            this.sortDescending.set(true);
        } else {
            // Currently descending -> remove sorting
            this.sortBy.set(null);
            this.sortDescending.set(false);
        }
    }

    private performSort(): void {
        const currentPageSize = this.usersPagedList()?.pageSize ?? this.pageSize;
        this.loadUsers(1, currentPageSize); // Reset to first page when sorting
    }

    private loadUsers(page: number, pageSize: number): void {
        this.userManagementServise.loadUsers(
            page,
            pageSize,
            this.searchTerm() || null, // Convert empty string to null
            this.sortBy(),
            this.sortBy() ? (this.sortDescending() ? "true" : "false") : null
        );
    }

    onDeleteClick(user: UserListModel): void {
        this.clickedUser.set(user);
        this.showDeleteModal.set(true);
    }

    onConfirmDelete(): void {
        this.showDeleteModal.set(false);
        const userId = this.clickedUser()?.id;
        if (!userId) return;

        this.userManagementServise.deleteProfile(userId).subscribe({
            next: () => {
                this.toaster.success(
                    `Потребителя '${this.clickedUser()?.fullName}' беше успешно изтрит`
                );
            },
            error: (error: ApiError) => {
                const errorDescroption = Utils.getGeneralErrorMessage(error);
                this.toaster.error(errorDescroption);
            },
        });
    }

    onCancelDelete(): void {
        this.showDeleteModal.set(false);
        this.clickedUser.set(null);
    }

    onPageSizeChange(pageSize: number): void {
        this.loadUsers(1, pageSize);
    }

    onPageChange(page: number): void {
        const currentPageSize = this.usersPagedList()?.pageSize ?? 10;
        this.loadUsers(page, currentPageSize);
    }

    onClearSearch(): void {
        this.searchTerm.set("");
        const currentPageSize = this.usersPagedList()?.pageSize ?? this.pageSize;
        this.loadUsers(1, currentPageSize);
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
        this.userManagementServise
            .toggleUserRole($event.user.id, $event.role)
            .subscribe({
                next: () => {
                    this.toaster.success(
                        `Ролята на потребителя '${$event.user.fullName}' беше успешно променена на '${$event.role}'`
                    );
                },
                error: (error: ApiError) => {
                    const errorDescription = Utils.getGeneralErrorMessage(error);
                    this.toaster.error(errorDescription);
                },
            });
    }
    private performSearch(): void {
        // Reset to first page when searching
        const currentPageSize = this.usersPagedList()?.pageSize ?? this.pageSize;
        this.loadUsers(1, currentPageSize);
    }

    getSortIcon(column: string): string {
        if (this.sortBy() !== column) {
            return "fas fa-sort text-muted";
        }
        const isDescending = this.sortDescending();
        return isDescending
            ? "fas fa-sort-up text-primary"   // descending
            : "fas fa-sort-down text-primary"; // ascending
    }

    isSortable(column: string): boolean {
        const sortableColumns = ["firstName", "midName", "lastName", "phoneNumber"];
        return sortableColumns.includes(column);
    }
}
