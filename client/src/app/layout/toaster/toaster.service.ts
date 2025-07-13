import { Injectable, signal } from '@angular/core';
import { ToasterMessage, ToasterConfig, ToasterState } from './toaster.model';
import { defaultDuration } from '../../common/constants';

@Injectable({
    providedIn: 'root'
})
export class ToasterService {
    private messages = signal<ToasterMessage[]>([]);

    readonly toasterMessages = this.messages.asReadonly();

    show(config: ToasterConfig): void {
        const id = this.generateId();
        const message: ToasterMessage = {
            id,
            message: config.message,
            type: config.type,
            duration: config.duration ?? defaultDuration,
            autoClose: config.autoClose ?? true,
            state: 'entering'
        };

        this.messages.update(messages => [...messages, message]);

        setTimeout(() => {
            this.updateMessageState(id, 'visible');
        }, 100);

        if (message.autoClose) {
            setTimeout(() => {
                this.startRemove(id);
            }, message.duration! + 100);
        }
    }

    success(message: string, duration?: number): void {
        this.show({ message, type: 'success', duration: duration });
    }

    error(message: string, duration?: number, autoClose: boolean = true): void {
        this.show({ message, type: 'error', duration: duration });
    }

    warning(message: string, duration?: number): void {
        this.show({ message, type: 'warning', duration: duration });
    }

    info(message: string, duration?: number): void {
        this.show({ message, type: 'info', duration: duration });
    }

    remove(id: string): void {
        this.messages.update(messages => messages.filter(msg => msg.id !== id));
    }

    startRemove(id: string): void {
        this.updateMessageState(id, 'leaving');

        setTimeout(() => {
            this.remove(id);
        }, 300);
    }

    updateMessageState(id: string, state: ToasterState): void {
        this.messages.update(messages =>
            messages.map(msg =>
                msg.id === id ? { ...msg, state } : msg
            )
        );
    }

    clear(): void {
        this.messages.set([]);
    }

    private generateId(): string {
        return `toaster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
