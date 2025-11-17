import type { Int } from '../datatypes/int';
import { createSchema, type Schema } from '../schema';

export type IntSchema = Schema<'int', Int>;

export const int: IntSchema = createSchema('int');
