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

@Component({
    selector: 'app-my-appointments-table',
    imports: [CommonModule, MyAppointmentsRow, Pager, ConfirmationModal],
    templateUrl: './my-appointments-table.html',
    styleUrl: './my-appointments-table.css'
})
export class MyAppointmentsTable extends BaseTableComponent<MyAppointmentModel> implements OnInit {
    private _appointmentService = inject(AppointmentService);
    private _authService = inject(AuthService);

    public showDeleteModal = signal(false);
    private _destroyedAppointmentId: string | null = null;

    public get appointments() { return this.items; }
    public get appointmentsPagedList() { return this.pagedList; }

    ngOnInit(): void {
        this.loadData();
    }

    protected loadDataFromService(request: PagedFilteredRequest): Observable<any> {
        const currentUser: UserInfo | null = this._authService.currentUser();
        if (!currentUser?.id) {
            throw new Error('Няма автентифициран потребител');
        }
        return this._appointmentService.getMyAppointments(currentUser.id, request);
    }

    protected mapServiceResponse(response: any): PagedResult<MyAppointmentModel> | null {
        return response.body
            ? <PagedResult<MyAppointmentModel>>{
                ...response.body,
                items: response.body.items.map((appointment: any) => {
                    return ({
                        ...appointment,
                    }) as MyAppointmentModel;
                })
            }
            : null;
    }

    protected override handleLoadError(error: any): void {
        console.error('Error loading my appointments:', error);
        // Тук можете да добавите специфично обработване на грешки ако е необходимо
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
        this.showDeleteModal.set(false);
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
