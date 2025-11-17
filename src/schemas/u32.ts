import type { U32 } from '../datatypes/u32';
import { createSchema, type Schema } from '../schema';

export type U32Schema = Schema<'u32', U32>;

export const u32: U32Schema = createSchema('u32');
