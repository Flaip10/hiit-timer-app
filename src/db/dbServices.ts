import { db } from './client';
import { createDbServices } from './createDbServices';

export const dbServices = createDbServices({ db });
