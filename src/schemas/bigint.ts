import { createSchema, type Schema } from '../schema';

export type BigIntSchema = Schema<'bigint', bigint>;

const _bigint: BigIntSchema = createSchema('bigint');

export { _bigint as bigint };
