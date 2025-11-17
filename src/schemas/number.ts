import { createSchema, type Schema } from '../schema';

export type NumberSchema = Schema<'number', number>;

const _number: NumberSchema = createSchema('number');

export { _number as number };
