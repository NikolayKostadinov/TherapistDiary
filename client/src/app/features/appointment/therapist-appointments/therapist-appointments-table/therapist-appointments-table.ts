import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { TherapistAppointmentsRow } from '../therapist-appointments-row/therapist-appointments-row';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UserInfo } from '../../../auth/models';
import { TherapistAppointmentModel } from '../../models';
import { ApiError, PagedResult, ConfirmationModal, Utils, PagedFilteredRequest, BaseTableComponent } from '../../../../common';
import { Pager } from '../../../../layout/pager/pager';

@Component({
    selector: 'app-therapist-appointments-table',
    imports: [CommonModule, TherapistAppointmentsRow, Pager, ConfirmationModal],
    templateUrl: './therapist-appointments-table.html',
    styleUrl: './therapist-appointments-table.css'
})
export class TherapistAppointmentsTable extends BaseTableComponent<TherapistAppointmentModel> implements OnInit {
    private _appointmentService = inject(AppointmentService);
    private _authService = inject(AuthService);

    // Специфични за този компонент сигнали
    private _destroyedAppointmentId: string | null = null;

    // Column visibility - специфична функционалност за този компонент
    private _visibleColumns = signal({
        date: true,
        time: true,
        patient: true,
        phone: true,
        therapy: true,
        notes: true
    });

    public visibleColumns = computed(() => this._visibleColumns());

    // Aliases за по-удобно използване в шаблона
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
        return this._appointmentService.getTherapistAppointments(currentUser.id, request);
    }

    protected mapServiceResponse(response: any): PagedResult<TherapistAppointmentModel> | null {
        return response.body
            ? <PagedResult<TherapistAppointmentModel>>{
                ...response.body,
                items: response.body.items.map((appointment: any) => {
                    return ({
                        ...appointment,
                        // Format dates and times if needed
                    }) as TherapistAppointmentModel;
                })
            }
            : null;
    }

    // Специфични методи за този компонент
    onDeleteClick(appointmentId: string): void {
        this.showDeleteModal.set(true);
        this._destroyedAppointmentId = appointmentId;
    }

    onConfirmDelete(): void {
        this.showDeleteModal.set(false);
        if (!this._destroyedAppointmentId) return;

        this.isLoading.set(true);
        const appointmentId = this._destroyedAppointmentId;
        this._appointmentService.deleteAppointment(appointmentId).subscribe({
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

    onCancelDelete(): void {
        this.onCancelModalAction();
        this._destroyedAppointmentId = null;
    }

    onUpdateNotes(event: { id: string, notes: string }): void {
        this.isLoading.set(true);
        this._appointmentService.updateTherapistNotes(event.id, event.notes)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.isLoading.set(false);
                    this.toaster.success('Бележките на терапевта са запазени успешно!');
                    this.loadData(); // Reload to get updated data
                },
                error: (error: ApiError) => {
                    this.isLoading.set(false);
                    this.toaster.error(`Грешка при запазване на бележките на терапевта! ${Utils.getGeneralErrorMessage(error)}`);
                }
            });
    }

    // Методи за управление на видимостта на колони
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
