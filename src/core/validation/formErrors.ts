export type FormErrorCode = string;

export interface FormError<FieldKey extends string = string> {
    field?: FieldKey; // undefined ⇒ form-level / global
    message: string;
}

/**
 * Get the first error for a given field.
 */
export const getFieldError = <F extends string>(
    errors: FormError<F>[],
    field: F
): FormError<F> | undefined => errors.find((e) => e.field === field);

/**
 * Get all non-field errors (global/form errors).
 */
export const getFormErrors = <F extends string>(
    errors: FormError<F>[]
): FormError<F>[] => errors.filter((e) => e.field == null);

/**
 * Turn a list of errors into a bullet string for banners.
 */
export const formatErrorList = <F extends string>(
    errors: FormError<F>[]
): string =>
    errors.length ? errors.map((e) => `• ${e.message}`).join('\n') : '';
