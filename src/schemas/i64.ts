import type { I64 } from '../datatypes/i64';
import { createSchema, type Schema } from '../schema';

export type I64Schema = Schema<'i64', I64>;

export const i64: I64Schema = createSchema('i64');
