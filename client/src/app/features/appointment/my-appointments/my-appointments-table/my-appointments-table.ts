import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { MyAppointmentsRow } from '../my-appointments-row/my-appointments-row';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UserInfo } from '../../../auth/models';
import { MyAppointmentModel } from '../../models';
import { ApiError, PagedResult, ConfirmationModal, Utils, PagedFilteredRequest, BaseTableComponent } from '../../../../common';
import { Pager } from '../../../../layout/pager/pager';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-my-appointments-table',
    imports: [CommonModule, MyAppointmentsRow, Pager, ConfirmationModal],
    templateUrl: './my-appointments-table.html',
    styleUrl: './my-appointments-table.css'
})
export class MyAppointmentsTable extends BaseTableComponent<MyAppointmentModel> implements OnInit {
    private _appointmentService = inject(AppointmentService);
    private _authService = inject(AuthService);

    private _destroyedAppointmentId: string | null = null;

    public get appointments() { return this.items; }
    public get appointmentsPagedList() { return this.pagedList; }

    ngOnInit(): void {
        this.loadData();
    }

    protected loadDataFromService(request: PagedFilteredRequest): Observable<HttpResponse<PagedResult<MyAppointmentModel>>> {
        const currentUser: UserInfo | null = this._authService.currentUser();
        if (!currentUser?.id) {
            throw new Error('Няма автентифициран потребител');
        }
        return this._appointmentService.getMyAppointments(currentUser.id, request);
    }

    // Специфични методи за този компонент
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
                this.loadData();
            },
            error: (error: ApiError) => {
                this.isLoading.set(false);
                this.toaster.error(`Грешка при изтриване на записа! ${Utils.getGeneralErrorMessage(error)}`);
            }
        });
        this._destroyedAppointmentId = null;
    }

    public onCancelDelete(): void {
        this.onCancelModalAction();
        this._destroyedAppointmentId = null;
    }

    onUpdateNotes(event: { id: string, notes: string }): void {
        this.isLoading.set(true);
        this._appointmentService.updateAppointmentNotes(event.id, event.notes)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.toaster.success('Бележките са запазени успешно!');
                    this.loadData(); // Reload to get updated data
                },
                error: (error: ApiError) => {
                    this.isLoading.set(false);
                    this.toaster.error(`Грешка при запазване на бележките! ${Utils.getGeneralErrorMessage(error)}`);
                }
            });
    }
}
