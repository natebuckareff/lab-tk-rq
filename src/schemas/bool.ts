import { createSchema, type Schema } from '../schema';

export const bool: Schema<'bool', boolean> = createSchema('bool');
