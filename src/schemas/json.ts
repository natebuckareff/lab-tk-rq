import type { Json } from '../datatypes/json';
import { createSchema, type Schema } from '../schema';

export type JsonSchema = Schema<'json', Json>;

export const json: JsonSchema = createSchema('json');
