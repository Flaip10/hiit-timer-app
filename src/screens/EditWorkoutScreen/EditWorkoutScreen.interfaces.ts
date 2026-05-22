import type { FormError } from '@src/core/validation/formErrors';

export type WorkoutEditField = 'name' | 'blocks' | 'exercises';

export interface WorkoutEditError extends FormError<WorkoutEditField> {
    targetId: WorkoutEditField;
}
