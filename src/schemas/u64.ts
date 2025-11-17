import type { U64 } from '../datatypes/u64';
import { createSchema, type Schema } from '../schema';

export type U64Schema = Schema<'u64', U64>;

export const u64: U64Schema = createSchema('u64');
