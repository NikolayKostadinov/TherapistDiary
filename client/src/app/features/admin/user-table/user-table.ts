import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, inject, OnInit, signal, computed } from "@angular/core";
import { Observable, of } from "rxjs";
import { ApiError, ConfirmationModal, PagedResult, Utils, PagedFilteredRequest, BaseTableComponent } from "../../../common";
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
export class UserTable extends BaseTableComponent<UserListModel> implements OnInit, AfterViewInit {
    private readonly userManagementService = inject(UserManagementService);

    // Специфични за този компонент сигнали
    protected clickedUser = signal<UserListModel | null>(null);
    protected showDeleteModal = signal(false);

    // Computed за compatibility с шаблона
    protected pageOffset = computed(() => {
        const currentPage = this.pagerData()?.page ?? 1;
        const currentPageSize = this.pagedList()?.pageSize ?? 10;
        return (currentPage - 1) * currentPageSize;
    });

    // Aliases за по-удобно използване в шаблона
    public get usersPagedList() { return this.pagedList; }
    public get usersPager() { return this.pagerData; }

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.loadData();
    }

    ngAfterViewInit(): void {
        // Initialization complete
    }

    protected loadDataFromService(request: PagedFilteredRequest): Observable<any> {
        // Директно връщаме празен Observable, защото ще използваме override на loadData
        return of(null);
    }

    protected mapServiceResponse(response: any): PagedResult<UserListModel> | null {
        return response;
    }

    protected override handleLoadError(error: any): void {
        console.error('Error loading users:', error);
    }

    // Override loadData за директна интеграция с UserManagementService
    public override loadData(): void {
        const request = this.createPagedFilteredRequest();

        // Използваме директно услугата
        this.userManagementService.loadUsers(
            request.pageNumber,
            request.pageSize,
            request.searchTerm,
            request.sortBy,
            request.sortDescending ? (request.sortDescending ? "true" : "false") : null
        );

        // Синхронизираме състоянието директно
        setTimeout(() => {
            this.pagedList.set(this.userManagementService.usersPagedList());
            this.isLoading.set(this.userManagementService.isLoading());
        }, 0);
    }

    // Специфични методи за този компонент
    onDeleteClick(user: UserListModel): void {
        this.clickedUser.set(user);
        this.showDeleteModal.set(true);
    }

    onConfirmDelete(): void {
        this.showDeleteModal.set(false);
        const userId = this.clickedUser()?.id;
        if (!userId) return;

        this.userManagementService.deleteProfile(userId).subscribe({
            next: () => {
                this.toaster.success(
                    `Потребителя '${this.clickedUser()?.fullName}' беше успешно изтрит`
                );
            },
            error: (error: ApiError) => {
                const errorDescription = Utils.getGeneralErrorMessage(error);
                this.toaster.error(errorDescription);
            },
        });
    }

    onCancelDelete(): void {
        this.showDeleteModal.set(false);
        this.clickedUser.set(null);
    }

    onToggleRole($event: ToggleRoleModel): void {
        this.userManagementService
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

    onClearSearch(): void {
        this.searchTerm.set("");
        this.currentPage.set(1);
        this.loadData();
    }

    // Override isSortable за специфичните колони
    public override isSortable(column: string): boolean {
        const sortableColumns = ["firstName", "midName", "lastName", "phoneNumber"];
        return sortableColumns.includes(column);
    }

    // Compatibility методи за шаблона
    onSortColumn(column: string): void {
        this.onSort(column);
    }
}
