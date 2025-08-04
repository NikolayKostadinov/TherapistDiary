import { Component, computed, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, throwError } from 'rxjs';
import { MyAppointmentsRow } from '../my-appointments-row/my-appointments-row';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UserInfo } from '../../../auth/models';
import { MyAppointmentModel } from '../../models';
import { ApiError, PagedResult, PagerModel, ConfirmationModal, Utils, PagedFilteredRequest } from '../../../../common';
import { Pager } from '../../../../layout/pager/pager';
import { ToasterService } from '../../../../layout';

@Component({
    selector: 'app-my-appointments-table',
    imports: [CommonModule, MyAppointmentsRow, Pager, ConfirmationModal],
    templateUrl: './my-appointments-table.html',
    styleUrl: './my-appointments-table.css'
})
export class MyAppointmentsTable implements OnInit {
    private _appointmentService = inject(AppointmentService);
    private _authService = inject(AuthService);
    private _destroyRef = inject(DestroyRef);
    private _toaster = inject(ToasterService);

    // Consolidated data and state
    public appointmentsPagedList = signal<PagedResult<MyAppointmentModel> | null>(null);
    public isLoading = signal<boolean>(false);
    public currentPage = signal(1);
    public pageSize = signal(10);
    public searchTerm = signal<string | null>(null);
    public sortBy = signal<string | null>(null);
    public sortDescending = signal<boolean | null>(null);
    public showDeleteModal = signal(false);
    private _destroyedAppointmentId: string | null = null;

    // Computed properties
    public appointments = computed(() => this.appointmentsPagedList()?.items || []);
    public pagerData = computed(() => {
        const pagedData = this.appointmentsPagedList();
        if (!pagedData) return null;
        return {
            totalCount: pagedData.totalCount,
            page: pagedData.page,
            pageSize: pagedData.pageSize,
            totalPages: pagedData.totalPages,
            hasNextPage: pagedData.hasNextPage,
            hasPreviousPage: pagedData.hasPreviousPage
        } as PagerModel;
    });

    ngOnInit(): void {
        this.loadAppointments();
    }

    public loadAppointments(): void {
        const currentUser: UserInfo | null = this._authService.currentUser();
        if (currentUser?.id) {
            this.isLoading.set(true);
            const parameters = this.createPagedFilteredRequest()
            this._appointmentService.getMyAppointments(currentUser.id, parameters).pipe(
                takeUntilDestroyed(this._destroyRef),
                map(response => response.body
                    ? <PagedResult<MyAppointmentModel>>{
                        ...response.body,
                        items: response.body.items.map((appointment: any) => {
                            return ({
                                ...appointment,
                            }) as MyAppointmentModel;
                        })
                    }
                    : null),
                catchError((error) => {
                    return throwError(() => error);
                })
            ).subscribe({
                next: (appointmentsPagedList: PagedResult<MyAppointmentModel> | null) => {
                    this.appointmentsPagedList.set(appointmentsPagedList);
                    this.isLoading.set(false);
                },
                error: (error: ApiError) => {
                    this.appointmentsPagedList.set(null);
                    this.isLoading.set(false);
                    console.error('Error loading my appointments:', error);
                },
            });
        }
    }

    private createPagedFilteredRequest() {
        return <PagedFilteredRequest>{
            pageNumber: this.currentPage(),
            pageSize: this.pageSize(),
            searchTerm: this.searchTerm(),
            sortBy: this.sortBy(),
            sortDescending: this.sortDescending()
        };
    }

    public onPageChange(page: number): void {
        this.currentPage.set(page);
        this.loadAppointments();
    }

    public onPageSizeChange(pageSize: number): void {
        this.pageSize.set(pageSize);
        this.currentPage.set(1);
        this.loadAppointments();
    }

    public onSearchInput(event: Event): void {
        const searchTerm = (event.target as HTMLInputElement).value;
        this.onSearch(searchTerm);
    }

    public onSearch(searchTerm: string): void {
        this.searchTerm.set(searchTerm || null);
        this.currentPage.set(1);
        this.loadAppointments();
    }

    public onSort(sortBy: string): void {
        if (this.sortBy() === sortBy) {
            const current = this.sortDescending();
            this.toggleSortOrder(current);
        } else {
            this.sortBy.set(sortBy);
            this.sortDescending.set(false);
        }
        this.currentPage.set(1);
        this.loadAppointments();
    }

    private toggleSortOrder(current: boolean | null): void {
        switch (current) {
            case null:
                this.sortDescending.set(false); // ascending
                break;
            case false:
                this.sortDescending.set(true); // descending
                break;
            case true:
                this.sortBy.set(null); // no sort
                this.sortDescending.set(null);
                break;
        }
    }

    public onDeleteClick(appointmentId: string): void {
        this.showDeleteModal.set(true);
        this._destroyedAppointmentId = appointmentId;
    }

    public onConfirmDelete(): void {
        this.showDeleteModal.set(false);
        if (!this._destroyedAppointmentId) return;

        this.isLoading.set(true);
        this._appointmentService.deleteAppointment(this._destroyedAppointmentId).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.loadAppointments();
            },
            error: (error: ApiError) => {
                this.isLoading.set(false);
                this._toaster.error(`Грешка при изтриване на записа! ${Utils.getGeneralErrorMessage(error)}`);
            }
        });
        this._destroyedAppointmentId = null;
    }

    public onCancelDelete(): void {
        this.showDeleteModal.set(false);
        this._destroyedAppointmentId = null;
    }

    onUpdateNotes(event: { id: string, notes: string }): void {
        this.isLoading.set(true);
        this._appointmentService.updateAppointmentNotes(event.id, event.notes)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this._toaster.success('Бележките са запазени успешно!');
                    this.loadAppointments(); // Reload to get updated data
                },
                error: (error: ApiError) => {
                    this.isLoading.set(false);
                    this._toaster.error(`Грешка при запазване на бележките! ${Utils.getGeneralErrorMessage(error)}`);
                }
            });
    }

    public getSortIcon(column: string): string {
        if (this.sortBy() !== column) {
            return "fas fa-sort text-muted";
        }
        const isDescending = this.sortDescending();
        if (isDescending === false) {
            return "fas fa-sort-down text-primary"; // ascending
        } else if (isDescending === true) {
            return "fas fa-sort-up text-primary";   // descending
        }
        return "fas fa-sort text-muted"; // no sort
    }
}
