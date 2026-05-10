import { nanoid } from 'nanoid/non-secure';

export const uid = (): string => nanoid(12);
