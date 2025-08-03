import { Component, computed, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, throwError } from 'rxjs';
import { TherapistAppointmentsRow } from '../therapist-appointments-row/therapist-appointments-row';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UserInfo } from '../../../auth/models';
import { TherapistAppointmentModel } from '../../models';
import { ApiError, PagedResult, PagerModel, ConfirmationModal, Utils } from '../../../../common';
import { Pager } from '../../../../layout/pager/pager';
import { ToasterService } from '../../../../layout';

@Component({
    selector: 'app-therapist-appointments-table',
    imports: [CommonModule, TherapistAppointmentsRow, Pager, ConfirmationModal],
    templateUrl: './therapist-appointments-table.html',
    styleUrl: './therapist-appointments-table.css'
})
export class TherapistAppointmentsTable implements OnInit {
    private _appointmentService = inject(AppointmentService);
    private _authService = inject(AuthService);
    private _destroyRef = inject(DestroyRef);
    private _toaster = inject(ToasterService);

    // Data signals
    private _appointmentsPagedList = signal<PagedResult<TherapistAppointmentModel> | null>(null);
    private _isLoading = signal<boolean>(false);

    // Pagination
    public currentPage = signal(1);
    public pageSize = signal(10);
    public searchTerm = signal<string | null>(null);
    public sortBy = signal<string | null>(null);
    public sortDescending = signal<boolean | null>(null);

    // Column visibility
    private _visibleColumns = signal({
        date: true,
        time: true,
        patient: true,
        phone: true,
        therapy: true,
        notes: true
    });

    public visibleColumns = computed(() => this._visibleColumns());

    // Computed properties
    public appointmentsPagedList = computed(() => this._appointmentsPagedList());
    public isLoading = computed(() => this._isLoading());
    public appointments = computed(() => this.appointmentsPagedList()?.items || []);
    public totalPages = computed(() => this.appointmentsPagedList()?.totalPages || 0);
    public totalCount = computed(() => this.appointmentsPagedList()?.totalCount || 0);

    private _destroyedAppointmentId: string | null = null;

    // Pager data for the Pager component
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

    protected showDeleteModal = signal(false);

    ngOnInit(): void {
        this.loadAppointments();
    }

    public loadAppointments(): void {
        const currentUser: UserInfo | null = this._authService.currentUser();
        if (currentUser?.id) {
            this._isLoading.set(true);
            this._appointmentService.getTherapistAppointments(
                currentUser.id,
                this.currentPage(),
                this.pageSize(),
                this.searchTerm(),
                this.sortBy(),
                this.sortDescending()
            )
                .pipe(
                    takeUntilDestroyed(this._destroyRef),
                    map((response: any) => response.body
                        ? <PagedResult<TherapistAppointmentModel>>{
                            ...response.body,
                            items: response.body.items.map((appointment: any) => {
                                return ({
                                    ...appointment,
                                    // Format dates and times if needed
                                }) as TherapistAppointmentModel;
                            })
                        }
                        : null),
                    catchError((error) => {
                        return throwError(() => error);
                    })
                ).subscribe({
                    next: (appointmentsPagedList: PagedResult<TherapistAppointmentModel> | null) => {
                        this._appointmentsPagedList.set(appointmentsPagedList);
                        this._isLoading.set(false);
                    },
                    error: (error: ApiError) => {
                        this._appointmentsPagedList.set(null);
                        this._isLoading.set(false);
                        console.error('Error loading therapist appointments:', error);
                    },
                });
        }
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

    public onSearch(searchTerm: string): void {
        this.searchTerm.set(searchTerm || null);
        this.currentPage.set(1);
        this.loadAppointments();
    }

    public onSearchInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.onSearch(target.value);
    }

    public onSort(sortBy: string): void {
        const currentSort = this.sortBy();
        const currentDirection = this.sortDescending();

        if (currentSort === sortBy) {
            // Same column clicked - cycle through states
            if (currentDirection === false) {
                // Currently ascending -> change to descending
                this.sortDescending.set(true);
            } else if (currentDirection === true) {
                // Currently descending -> remove sorting
                this.sortBy.set(null);
                this.sortDescending.set(null);
            } else {
                // No sorting -> set to ascending
                this.sortBy.set(sortBy);
                this.sortDescending.set(false);
            }
        } else {
            // New sort field: set ascending
            this.sortBy.set(sortBy);
            this.sortDescending.set(false);
        }

        this.currentPage.set(1);
        this.loadAppointments();
    }

    getSortIcon(column: string): string {
        if (this.sortBy() !== column) {
            return "fas fa-sort text-muted";
        }
        return this.sortDescending()
            ? "fas fa-arrow-down text-primary"
            : "fas fa-arrow-up text-primary";
    }

    onDeleteClick(appointmentId: string): void {
        this.showDeleteModal.set(true);
        this._destroyedAppointmentId = appointmentId;
    }

    onConfirmDelete(): void {
        this.showDeleteModal.set(false);
        if (this._destroyedAppointmentId) {
            this._isLoading.set(true);
            const appointmentId = this._destroyedAppointmentId ?? '';
            this._appointmentService.deleteAppointment(appointmentId).subscribe({
                next: () => {
                    this._isLoading.set(false);
                    this.loadAppointments();
                },
                error: (error: ApiError) => {
                    this._isLoading.set(false);
                    this._toaster.error(`Грешка при изтриване на записа! ${Utils.getGeneralErrorMessage(error)}`);
                }
            });
            this._destroyedAppointmentId = null;
        }
    }

    onCancelDelete(): void {
        this.showDeleteModal.set(false);
    }

    onUpdateNotes(event: { id: string, notes: string }): void {
        this._isLoading.set(true);
        this._appointmentService.updateTherapistNotes(event.id, event.notes)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
                next: () => {
                    this._isLoading.set(false);
                    this._toaster.success('Бележките на терапевта са запазени успешно!');
                    this.loadAppointments(); // Reload to get updated data
                },
                error: (error: ApiError) => {
                    this._isLoading.set(false);
                    this._toaster.error(`Грешка при запазване на бележките на терапевта! ${Utils.getGeneralErrorMessage(error)}`);
                }
            });
    }

    toggleColumn(columnKey: string): void {
        const currentColumns = this._visibleColumns();
        const updatedColumns = { ...currentColumns };

        switch (columnKey) {
            case 'date':
                updatedColumns.date = !updatedColumns.date;
                break;
            case 'time':
                updatedColumns.time = !updatedColumns.time;
                break;
            case 'patient':
                updatedColumns.patient = !updatedColumns.patient;
                break;
            case 'phone':
                updatedColumns.phone = !updatedColumns.phone;
                break;
            case 'therapy':
                updatedColumns.therapy = !updatedColumns.therapy;
                break;
            case 'notes':
                updatedColumns.notes = !updatedColumns.notes;
                break;
        }

        this._visibleColumns.set(updatedColumns);
    }

    getVisibleColumnsCount(): number {
        const columns = this._visibleColumns();
        let count = 2; // # + Бележки на терапевта (винаги видими)
        if (columns.date) count++;
        if (columns.time) count++;
        if (columns.patient) count++;
        if (columns.phone) count++;
        if (columns.therapy) count++;
        if (columns.notes) count++;
        return count;
    }
}
