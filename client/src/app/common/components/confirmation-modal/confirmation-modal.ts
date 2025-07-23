import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirmation-modal',
    imports: [CommonModule],
    templateUrl: './confirmation-modal.html',
    styleUrl: './confirmation-modal.css'
})
export class ConfirmationModal {
    @Input() isVisible = false;
    @Input() title = 'Потвърждение';
    @Input() message = 'Сигурни ли сте, че искате да продължите?';
    @Input() warningText = '';
    @Input() confirmText = 'Потвърди';
    @Input() cancelText = 'Отказ';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm(): void {
        this.confirm.emit();
    }

    onCancel(): void {
        this.cancel.emit();
    }

    onOverlayClick(event: Event): void {
        if (event.target === event.currentTarget) {
            this.onCancel();
        }
    }
}
