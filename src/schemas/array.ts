import { type AnySchema, createSchema, type Schema } from '../schema';

export type ArraySchema<S extends AnySchema> = Schema<'array', S['Type'][], S>;

export const array = <S extends AnySchema>(schema: S): ArraySchema<S> => {
  return createSchema('array', schema);
};
