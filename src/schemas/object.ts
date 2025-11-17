import { type AnySchema, createSchema, type Schema } from '../schema';
import type { Simplify } from '../util';

export type ObjectSchema<S extends ObjectSpec> = Schema<
  'object',
  InferObjectType<S>,
  S
>;

export type ObjectSpec = Record<string, AnySchema>;

export type InferObjectType<S extends ObjectSpec> = Simplify<
  {
    [K in keyof S as S[K]['kind'] extends 'option' ? never : K]: S[K]['Type'];
  } & {
    [K in keyof S as S[K]['kind'] extends 'option' ? K : never]?: S[K]['Type'];
  }
>;

const _object = <S extends ObjectSpec>(spec: S): ObjectSchema<S> => {
  return createSchema('object', spec);
};

export { _object as object };
