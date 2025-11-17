import { type AnySchema, createSchema, type Schema } from '../schema';
import type { Simplify } from '../util';

export type TupleSchema<S extends AnySchema[]> = Schema<
  'tuple',
  InferTupleType<S>,
  S
>;

export type InferTupleType<S extends AnySchema[]> = Simplify<{
  [K in keyof S]: S[K]['Type'];
}>;

export const tuple = <S extends AnySchema[]>(...schemas: S): TupleSchema<S> => {
  return createSchema('tuple', schemas);
};
