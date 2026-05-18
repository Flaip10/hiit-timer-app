import type { FormError } from '@src/core/validation/formErrors';

export type WorkoutEditField = 'name' | 'blocks' | 'exercises';

export type WorkoutEditError = FormError<WorkoutEditField>;
