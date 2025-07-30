import { Component, computed, inject } from '@angular/core';
import { ToasterService } from './toaster.service';
import { NgClass } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'app-toaster',
    imports: [NgClass],
    templateUrl: './toaster.html',
    styleUrl: './toaster.css',
    animations: [
        trigger('slideInOut', [
            state('entering', style({
                transform: 'translateX(100%)',
                opacity: 0
            })),
            state('visible', style({
                transform: 'translateX(0)',
                opacity: 1
            })),
            state('leaving', style({
                transform: 'translateX(100%)',
                opacity: 0
            })),
            transition('entering => visible', [
                animate('300ms ease-out')
            ]),
            transition('visible => leaving', [
                animate('300ms ease-in')
            ])
        ])
    ]
})
export class Toaster {
    private toasterService = inject(ToasterService);

    messages = computed(() => this.toasterService.toasterMessages());

    constructor() { }

    onClose(id: string): void {
        this.toasterService.startRemove(id);
    }

    getIconClass(type: string): string {
        switch (type) {
            case 'success':
                return 'fas fa-check-circle';
            case 'error':
                return 'fas fa-times-circle';
            case 'warning':
                return 'fas fa-exclamation-triangle';
            case 'info':
                return 'fas fa-info-circle';
            default:
                return 'fas fa-info-circle';
        }
    }
}
