import { FormGroup } from "@angular/forms";
import { HEADER_KEYS } from "./constants";
import { ApiError, ApiErrorResponse, ValidationError } from "./models";
import { WritableSignal } from '@angular/core';

export abstract class Utils {

    static getAuthorizationHeader(newToken: string): string {
        return `${HEADER_KEYS.BEARER_KEY}${newToken}`;
    }

    static isPublicUrl(url: string): boolean {
        const publicEndpoints = ['/login', '/register', '/refresh'];
        const isPublic = publicEndpoints.some(endpoint => url.includes(endpoint));
        console.log('Utils.isPublicUrl check:', url, '-> isPublic:', isPublic);
        return isPublic;
    }

    static getErrorMessage(error: any, context: string = 'данни'): string {
        if (error.status === 401) {
            // Special handling for authentication context
            if (context === 'влизане' || context === 'authentication') {
                return 'Неправилно потребителско име или парола.';
            }
            return `Нямате права за достъп до ${context}.`;
        }
        if (error.status === 400) {
            // For auth context, show more specific message
            if (context === 'влизане' || context === 'authentication') {
                return error.error?.message || 'Невалидни данни.';
            }
            return 'Невалидни данни.';
        }
        if (error.status === 404) {
            return `${context.charAt(0).toUpperCase() + context.slice(1)} не бяха намерени.`;
        }
        if (error.status === 500) {
            // For auth context, show more specific message
            if (context === 'влизане' || context === 'authentication') {
                return 'Вътрешна грешка на сървъра. Моля опитайте по-късно.';
            }
            return 'Проблем със сървъра. Моля, опитайте отново по-късно.';
        }
        if (error.status === 0) {
            return 'Не може да се свърже със сървъра. Моля проверете интернет връзката си.';
        }
        if (!navigator.onLine) {
            return 'Няма интернет връзка. Моля, проверете мрежата си.';
        }

        // Default messages based on context
        if (context === 'влизане' || context === 'authentication') {
            return 'Възникна грешка при влизане. Моля опитайте отново.';
        }
        return `Възникна неочаквана грешка при зареждане на ${context}.`;
    }

    static setupClearServerErrorsOnValueChange(
        form: FormGroup,
        serverErrors: WritableSignal<ValidationError[]>,
    ): void {
        // Абониране за промени в стойностите на всички полета
        Object.keys(form.controls).forEach(fieldName => {
            const control = form.get(fieldName);
            if (control) {
                control.valueChanges.subscribe(() => {
                    const currentErrors = serverErrors();
                    const filteredErrors = currentErrors.filter(error =>
                        error.field.toLocaleLowerCase() !== fieldName.toLowerCase()
                    );
                    serverErrors.set(filteredErrors);
                });
            }
        });
    }

    static isKnownFormField(fieldName: string, form: FormGroup): boolean {
        const formFields = Object.keys(form.controls) || [];
        const fieldNameLower = fieldName.toLowerCase();

        return formFields.some(field => field.toLowerCase() === fieldNameLower);
    }

    static getFieldError(fieldName: string, form: FormGroup, serverErrors: ValidationError[]): string {
        const field = form.get(fieldName);

        // Check for client-side validation errors first
        if (field?.errors && field.touched) {
            if (field.errors['required']) return `Полето е задължително`;
            if (field.errors['email']) return 'Невалиден email адрес';
            if (field.errors['minlength']) return `Полето трябва да съдържа поне ${field.errors['minlength'].requiredLength} символа`;
            if (field.errors['pattern']) return 'Невалиден формат на телефонен номер';
            if (field.errors['mismatch']) return 'Паролите не съвпадат';
        }

        // Check for server-side validation errors
        const serverError = serverErrors.find((error: ValidationError) => {
            return error.field.toLowerCase() === fieldName.toLowerCase();
        });

        if (serverError) {
            return serverError.message;
        }

        return '';
    }

    static markFormGroupTouched(form: FormGroup): void {
        Object.keys(form.controls).forEach(key => {
            const control = form.get(key);
            control?.markAsTouched();
        });
    }

    static extractApiErrors(error: ApiError): ValidationError[] {
        if (error?.error?.errors && Array.isArray(error.error.errors)) {
            return error.error.errors;
        }
        if (error?.errors && Array.isArray(error.errors)) {
            return error.errors;
        }
        return [];
    }

    static processValidationErrors(apiErrors: ValidationError[], form: FormGroup, genericMessage: string = 'Възникна грешка'): { serverErrors: ValidationError[], generalErrorsDescription: string } {
        const serverErrors: ValidationError[] = [];
        const generalErrors: ValidationError[] = [];

        apiErrors.forEach(err => {
            if (Utils.isKnownFormField(err.field, form)) {
                serverErrors.push(err);
            } else {
                generalErrors.push(err);
            }
        });

        const generalErrorsDescription = generalErrors.length > 0
            ? generalErrors.map(e => e.message).join('; ')
            : genericMessage;

        return { serverErrors, generalErrorsDescription };
    }

    static getGeneralErrorMessage(error: ApiError): string {
        if (error?.error?.title || error?.error?.detail) {
            return error.error.detail || error.error.title || 'Грешка при регистрация';
        } else if (error?.message) {
            return error.message;
        } else {
            return 'Невалидни данни';
        }
    }

    static handleError(errors: ApiErrorResponse, form: FormGroup): { serverErrors: ValidationError[], generalError: string } {
        const apiErrors = Utils.extractApiErrors(errors);
        let serverErrors: ValidationError[] = [];
        let generalError = '';

        if (apiErrors.length > 0) {
            let { serverErrors, generalErrorsDescription } = Utils.processValidationErrors(apiErrors, form, 'Невалидни данни');
            serverErrors = [...serverErrors]
            generalError = generalErrorsDescription;
        } else {
            generalError = Utils.getGeneralErrorMessage(errors);
        }

        return { serverErrors, generalError };
    }
}