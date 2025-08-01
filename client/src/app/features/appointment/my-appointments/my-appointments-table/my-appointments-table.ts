import { Component, computed, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, throwError } from 'rxjs';
import { MyAppointmentsRow } from '../my-appointments-row/my-appointments-row';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UserInfo } from '../../../auth/models';
import { MyAppointmentModel } from '../../models';
import { ApiError, PagedResult } from '../../../../common';

@Component({
    selector: 'app-my-appointments-table',
    imports: [CommonModule, MyAppointmentsRow],
    templateUrl: './my-appointments-table.html',
    styleUrl: './my-appointments-table.css'
})
export class MyAppointmentsTable implements OnInit {
    private appointmentService = inject(AppointmentService);
    private authService = inject(AuthService);
    private destroyRef = inject(DestroyRef);

    // Data signals
    private _appointmentsPagedList = signal<PagedResult<MyAppointmentModel> | null>(null);
    private _isLoading = signal<boolean>(false);

    // Pagination
    public currentPage = signal(1);
    public pageSize = signal(10);
    public searchTerm = signal<string | null>(null);
    public sortBy = signal<string | null>(null);
    public sortDescending = signal<string | null>(null);

    // Computed properties
    public appointmentsPagedList = computed(() => this._appointmentsPagedList());
    public isLoading = computed(() => this._isLoading());
    public appointments = computed(() => this.appointmentsPagedList()?.items || []);
    public totalPages = computed(() => this.appointmentsPagedList()?.totalPages || 0);
    public totalCount = computed(() => this.appointmentsPagedList()?.totalCount || 0);

    ngOnInit(): void {
        this.loadAppointments();
    }

    public loadAppointments(): void {
        const currentUser: UserInfo | null = this.authService.currentUser();
        if (currentUser?.id) {
            this._isLoading.set(true);
            this.appointmentService.getMyAppointments(
                currentUser.id,
                this.currentPage(),
                this.pageSize(),
                this.searchTerm(),
                this.sortBy(),
                this.sortDescending()
            )
                .pipe(
                    takeUntilDestroyed(this.destroyRef),
                    map(response => response.body
                        ? <PagedResult<MyAppointmentModel>>{
                            ...response.body,
                            items: response.body.items.map((appointment: any) => {
                                return ({
                                    ...appointment,
                                    // Format dates and times if needed
                                }) as MyAppointmentModel;
                            })
                        }
                        : null),
                    catchError((error) => {
                        return throwError(() => error);
                    })
                ).subscribe({
                    next: (appointmentsPagedList: PagedResult<MyAppointmentModel> | null) => {
                        this._appointmentsPagedList.set(appointmentsPagedList);
                        this._isLoading.set(false);
                    },
                    error: (error: ApiError) => {
                        this._appointmentsPagedList.set(null);
                        this._isLoading.set(false);
                        console.error('Error loading my appointments:', error);
                    },
                });
        }
    }

    public onPageChange(page: number): void {
        this.currentPage.set(page);
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
            // Toggle direction
            this.sortDescending.set(currentDirection === 'true' ? 'false' : 'true');
        } else {
            // New sort field
            this.sortBy.set(sortBy);
            this.sortDescending.set('false');
        }

        this.currentPage.set(1);
        this.loadAppointments();
    }
}
