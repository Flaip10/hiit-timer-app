import type { FormError } from '@src/core/validation/formErrors';

export type WorkoutEditField = 'name' | 'blocks';

export type WorkoutEditError = FormError<WorkoutEditField>;
