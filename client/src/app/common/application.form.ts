import { signal } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ApiError, ApiErrorResponse, ValidationError } from "./models";
import { Utils } from "./utils";
import { ToasterService } from "../layout";

export abstract class ApplicationForm {
    protected form: FormGroup;
    protected serverErrors = signal<ValidationError[]>([]);
    protected generalError = signal<string>('');
    protected readonly fb: FormBuilder;
    protected readonly toaster: ToasterService;

    constructor(fb: FormBuilder, toaster: ToasterService) {
        this.fb = fb;
        this.toaster = toaster;
        this.form = this.fb.group({});
    }

    protected clearErrors(): void {
        this.serverErrors.set([]);
        this.generalError.set('');
    }

    protected getFieldError(fieldName: string): string {
        return Utils.getFieldError(fieldName, this.form, this.serverErrors());
    }

    protected processApiErrorResponse(error: ApiError): void {
        const convertedError = error as ApiErrorResponse;
        if (convertedError) {
            const { serverErrors, generalError } = Utils.handleError(convertedError, this.form);
            this.serverErrors.set(serverErrors);
            this.generalError.set(generalError);
        } else {
            this.toaster.error('Възникна при обновяване на профила. Моля, опитайте отново.');
            console.error('Registration error:', error);
        }
    }
}
