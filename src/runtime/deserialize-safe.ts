import { Temporal } from 'temporal-polyfill';
import { assertI32 } from '../datatypes/i32';
import { assertI64 } from '../datatypes/i64';
import { int } from '../datatypes/int';
import {
  isObject,
  type Json,
  type JsonObject,
  parseBoolean,
  parseString,
} from '../datatypes/json';
import { assertU32 } from '../datatypes/u32';
import { assertU64 } from '../datatypes/u64';
import type { AnySchema } from '../schema';
import type {
  ArraySchema,
  ChoiceSchema,
  ChoiceSpec,
  TupleSchema,
} from '../schemas';
import type { ObjectSchema, ObjectSpec } from '../schemas/object';

const DATE_TIME_STRING_FORMAT_REGEX =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export const deserializeSafe = <S extends AnySchema>(
  schema: S,
  input: Json,
): S['Type'] => {
  switch (schema.kind) {
    case 'bool':
      return parseBoolean(input);

    case 'string':
      return parseString(input);

    case 'int':
      if (typeof input !== 'number') {
        throw new Error('int is not a number');
      }
      return int(input);

    case 'u32':
      if (typeof input !== 'number') {
        throw new Error('u32 is not a number');
      }
      assertU32(input);
      return input;

    case 'i32':
      if (typeof input !== 'number') {
        throw new Error('i32 is not a number');
      }
      assertI32(input);
      return input;

    case 'json':
      return input;

    case 'number':
      if (typeof input === 'number') {
        return input;
      } else if (typeof input === 'string') {
        if (!FLOAT64_REGEX.test(input)) {
          throw new Error('invalid number');
        }
        return Number(input);
      } else {
        throw new Error('invalid type');
      }

    case 'bigint':
      if (typeof input !== 'string') {
        throw new Error('invalid type');
      }
      if (!INTEGER_REGEX.test(input)) {
        throw new Error('invalid bigint');
      }
      return BigInt(input);

    case 'u64': {
      if (typeof input !== 'string') {
        throw new Error('invalid type');
      }
      if (!INTEGER_REGEX.test(input)) {
        throw new Error('invalid u64');
      }
      if (input[0] === '-') {
        // TODO:
        // - what we were parsing
        // - what we expected
        // - what we got
        throw new Error('invalid signed value');
      }
      const value = BigInt(input);
      assertU64(value);
      return value;
    }

    case 'i64': {
      if (typeof input !== 'string') {
        throw new Error('invalid type');
      }
      if (!INTEGER_REGEX.test(input)) {
        throw new Error('invalid i64');
      }
      const value = BigInt(input);
      assertI64(value);
      return value;
    }

    case 'date':
      if (typeof input !== 'string') {
        throw new Error('invalid type');
      }
      if (!DATE_TIME_STRING_FORMAT_REGEX.test(input)) {
        throw new Error('invalid date');
      }
      return new Date(input);

    case 'duration':
      if (typeof input !== 'string') {
        throw new Error('invalid type');
      }
      return Temporal.Duration.from(input);

    case 'instant':
      if (typeof input !== 'string') {
        throw new Error('invalid type');
      }
      return Temporal.Instant.from(input);

    case 'plainDateTime':
      if (typeof input !== 'string') {
        throw new Error('invalid type');
      }
      return Temporal.PlainDateTime.from(input);

    case 'plainDate':
      if (typeof input !== 'string') {
        throw new Error('invalid type');
      }
      return Temporal.PlainDate.from(input);

    case 'plainMonthDay':
      if (typeof input !== 'string') {
        throw new Error('invalid type');
      }
      return Temporal.PlainMonthDay.from(input);

    case 'option':
      return input === undefined
        ? undefined // XXX
        : deserializeSafe(schema.spec, input);

    case 'array': {
      if (!Array.isArray(input)) {
        throw new Error('invalid type');
      }
      const { spec } = schema as ArraySchema<AnySchema>;
      return input.map(item => deserializeSafe(spec, item));
    }

    case 'tuple': {
      if (!Array.isArray(input)) {
        throw new Error('invalid type');
      }
      if (input.length !== schema.spec.length) {
        throw new Error('invalid tuple');
      }
      const { spec } = schema as TupleSchema<AnySchema[]>;
      return input.map((item, i) => deserializeSafe(spec[i]!, item));
    }

    case 'object':
      if (!isObject(input)) {
        throw new Error('invalid type');
      }
      return deserializeObject(schema, input);

    case 'choice':
      if (!isObject(input)) {
        throw new Error('invalid type');
      }
      return deserializeChoice(schema, input);

    default:
      throw new Error(`unsupported schema kind "${schema.kind}"`);
  }
};

const deserializeObject = <S extends ObjectSchema<ObjectSpec>>(
  schema: S,
  input: JsonObject,
): S['Type'] => {
  let output: Record<string, unknown> | undefined;
  for (const [key, valueSchema] of Object.entries(schema.spec)) {
    const value = input[key];
    if (value === undefined) {
      throw Error(`missing property "${key}"`);
    }
    const deserializedValue = deserializeSafe(valueSchema, value);
    if (output) {
      output[key] = deserializedValue;
    } else if (value !== deserializedValue) {
      output ??= { ...input };
      output[key] = deserializedValue;
    }
  }
  return output ?? input;
};

const deserializeChoice = <S extends ChoiceSchema<ChoiceSpec>>(
  schema: S,
  input: JsonObject,
): S['Type'] => {
  const { kind, ...rest } = input;

  if (typeof kind !== 'string') {
    throw new Error('invalid kind tag');
  }

  const variantSchema = schema.spec[kind];

  if (variantSchema === undefined) {
    throw new Error(`unknown kind "${kind}"`);
  }

  const keys = Object.keys(rest);

  if (variantSchema === null) {
    if (keys.length > 1) {
      throw new Error(`unexpected properties on variant "${kind}"`);
    }
    return input as S['Type'];
  }

  if (variantSchema.kind === 'object') {
    const value = deserializeObject(
      variantSchema as ObjectSchema<ObjectSpec>,
      rest,
    );
    return value === rest ? (input as S['Type']) : { kind, ...value };
  }

  if (keys.length > 2) {
    throw new Error(`unexpected properties on variant "${kind}"`);
  }

  const inputValue = rest.value;

  if (inputValue === undefined) {
    throw new Error('missing value');
  }

  const outputValue = deserializeSafe(variantSchema, inputValue);

  return inputValue === outputValue
    ? (input as S['Type'])
    : ({ kind, value: outputValue } as S['Type']);
};
