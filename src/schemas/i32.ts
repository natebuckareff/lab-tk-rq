import type { I32 } from '../datatypes/i32';
import { createSchema, type Schema } from '../schema';

export type I32Schema = Schema<'i32', I32>;

export const i32: I32Schema = createSchema('i32');
