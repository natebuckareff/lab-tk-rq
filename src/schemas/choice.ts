import { type AnySchema, createSchema, type Schema } from '../schema';
import type { Simplify } from '../util';
import { number } from './number';
import { type ObjectSchema, object } from './object';
import { string } from './string';

export type ChoiceSchema<S extends ChoiceSpec> = Schema<
  'choice',
  InferChoiceType<S>,
  S
>;

export type ChoiceSpec = Record<string, AnySchema | null>;

export type InferChoiceType<Spec extends ChoiceSpec> = Simplify<
  {
    [K in keyof Spec]: Spec[K] extends ObjectSchema<any>
      ? { kind: K } & Spec[K]['Type']
      : Spec[K] extends AnySchema
        ? { kind: K; value: Spec[K]['Type'] }
        : { kind: K };
  }[keyof Spec]
>;

export const choice = <S extends ChoiceSpec>(spec: S): ChoiceSchema<S> => {
  return createSchema('choice', spec);
};

const schema = choice({
  a: object({
    x: number,
  }),
  b: object({
    y: string,
  }),
  c: null,
  d: string,
});

const x: (typeof schema)['Type'] = {} as any;
