import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { map, Observable } from "rxjs";
import { ApiError, ConfirmationModal, PagedResult, Utils, PagedFilteredRequest, BaseTableComponent } from "../../../common";
import { Pager } from "../../../layout/pager/pager";
import { UserListModel } from "../../profile/models/user-list.model";
import { ToggleRoleModel } from "../models/toggle-role.model";
import { UserManagementService } from "../services/user-management.service";
import { UserTableRow } from "../user-table-row/user-table-row";
import { UserProfileModel } from "../../profile/models";
import { HttpResponse } from "@angular/common/http";

@Component({
    selector: "app-user-table",
    imports: [CommonModule, ConfirmationModal, UserTableRow, Pager],
    templateUrl: "./user-table.html",
    styleUrl: "./user-table.css",
})
export class UserTable extends BaseTableComponent<UserListModel> implements OnInit {
    private readonly userManagementService = inject(UserManagementService);

    // Специфични за този компонент сигнали
    protected clickedUser = signal<UserListModel | null>(null);

    // Aliases за по-удобно използване в шаблона
    public get usersPagedList() { return this.pagedList; }
    public get usersPager() { return this.pagerData; }

    ngOnInit(): void {
        this.loadData();
    }

    protected loadDataFromService(request: PagedFilteredRequest): Observable<HttpResponse<PagedResult<UserListModel>>> {
        return this.userManagementService.getAllUsers(request).pipe(
            map(response => this.mapResponseToPagedResult(response))
        );
    }

    private mapResponseToPagedResult(response: HttpResponse<PagedResult<UserProfileModel>>): HttpResponse<PagedResult<UserListModel>> {
        if (!response.body) {
            return new HttpResponse({
                body: this.getDefaultPagedResult()
            });
        }

        return new HttpResponse({
            body: {
                ...response.body,
                items: response.body.items.map(user => ({
                    ...user,
                    rolesView: user.roles.length
                        ? user.roles.map(role => role.name).join(', ')
                        : '-'
                }))
            } as PagedResult<UserListModel>
        });
    }

    private getDefaultPagedResult(): PagedResult<UserListModel> | null | undefined {
        return {
            items: [],
            totalCount: 0,
            page: 1,
            pageSize: 10,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
        } as PagedResult<UserListModel>;
    }

    // Специфични методи за този компонент
    public onDeleteClick(user: UserListModel): void {
        this.clickedUser.set(user);
        this.showDeleteModal.set(true);
    }

    public onConfirmDelete(): void {
        this.showDeleteModal.set(false);
        const userId = this.clickedUser()?.id;
        if (!userId) return;

        this.isLoading.set(true);
        this.userManagementService.deleteProfile(userId).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.toaster.success(
                    `Потребителя '${this.clickedUser()?.fullName}' беше успешно изтрит`
                );
                this.loadData();
            },
            error: (error: ApiError) => {
                this.isLoading.set(false);
                const errorDescription = Utils.getGeneralErrorMessage(error);
                this.toaster.error(errorDescription);
            },
        });
    }

    public onCancelDelete(): void {
        this.onCancelModalAction();
        this.clickedUser.set(null);
    }

    public onToggleRole($event: ToggleRoleModel): void {
        this.isLoading.set(true);
        this.userManagementService
            .toggleUserRole($event.user, $event.role)
            .subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.toaster.success(
                        `Ролята на потребителя '${$event.user.fullName}' беше успешно променена на '${$event.role}'`
                    );
                    this.loadData();
                },
                error: (error: ApiError) => {
                    this.isLoading.set(false);
                    const errorDescription = Utils.getGeneralErrorMessage(error);
                    this.toaster.error(errorDescription);
                },
            });
    }

    // Премахваме дублирания метод - вече е в базовия клас
    // public onClearSearch(): void {
    //     this.searchTerm.set("");
    //     this.currentPage.set(1);
    //     this.loadData();
    // }

    // Override isSortable за специфичните колони
    public override isSortable(column: string): boolean {
        const sortableColumns = ["firstName", "midName", "lastName", "phoneNumber"];
        return sortableColumns.includes(column);
    }

    // Compatibility методи за шаблона
    public onSortColumn(column: string): void {
        this.onSort(column);
    }
}
