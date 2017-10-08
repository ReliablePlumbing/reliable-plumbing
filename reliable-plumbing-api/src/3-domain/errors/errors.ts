import { ErrorType } from '../enums/error-type';

export class AppError extends Error {
    constructor(errors: string[] | string, errorType: ErrorType) {
        let errorsString = '';
        if (typeof errors == 'object') {
            errors[0] = errors[0];
            errorsString = errors.join('\n');
        }
        else
            errorsString = errors;

        super(errorsString);
        this.errorType = errorType;
    }

    errorType: ErrorType;
}