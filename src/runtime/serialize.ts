import type { Json, JsonObject } from '../datatypes/json';
import type { AnySchema } from '../schema';
import type { ArraySchema, TupleSchema } from '../schemas';
import type { ChoiceSchema, ChoiceSpec } from '../schemas/choice';
import type { ObjectSchema, ObjectSpec } from '../schemas/object';

export interface SerializeOptions {
  numberPassthrough?: boolean;
  dateTimePassthrough?: boolean;
  choiceFallthrough?: boolean;
  cow?: boolean;
}

export const serialize = <S extends AnySchema>(
  schema: S,
  input: S['Type'],
  options: SerializeOptions | undefined,
): Json => {
  switch (schema.kind) {
    case 'bool':
    case 'string':
    case 'int':
    case 'u32':
    case 'i32':
    case 'json':
      return input;

    case 'number':
      if (options?.numberPassthrough) {
        return input;
      } else {
        return serializeNumber(input);
      }

    case 'bigint':
    case 'u64':
    case 'i64':
      return input.toString();

    case 'date':
      if (options?.dateTimePassthrough) {
        return input;
      } else {
        return input.toISOString();
      }

    case 'duration':
    case 'instant':
    case 'plainDateTime':
    case 'plainDate':
    case 'plainMonthDay':
    case 'plainTime':
    case 'plainYearMonth':
    case 'zonedDateTime':
      if (options?.dateTimePassthrough) {
        return input;
      } else {
        return input.toString();
      }

    case 'option':
      return input === undefined
        ? (undefined as unknown as Json) // XXX
        : serialize(schema.spec, input, options);

    case 'array': {
      const { spec } = schema as ArraySchema<AnySchema>;
      return (input as unknown[]).map(item => serialize(spec, item, options));
    }

    case 'tuple': {
      const { spec } = schema as TupleSchema<AnySchema[]>;
      return (input as unknown[]).map((item, i) =>
        serialize(spec[i]!, item, options),
      );
    }

    case 'object':
      return serializeObject(schema, input, options);

    case 'choice':
      return serializeChoice(schema, input, options);

    default:
      throw new Error(`unsupported schema kind "${schema.kind}"`);
  }
};

const serializeNumber = (input: number): number | string => {
  if (Number.isNaN(input) || !Number.isFinite(input)) {
    return input.toString();
  }
  return input;
};

const serializeObject = <S extends ObjectSchema<ObjectSpec>>(
  schema: S,
  input: S['Type'],
  options: SerializeOptions | undefined,
): JsonObject => {
  let output: JsonObject | undefined;
  for (const [key, valueSchema] of Object.entries(schema.spec)) {
    const value = input[key];
    const serializedValue = serialize(valueSchema, value, options);
    if (output) {
      output[key] = serializedValue;
    } else if (value !== serializedValue) {
      output ??= { ...input };
      output[key] = serializedValue;
    }
  }
  return output ?? input;
};

const serializeChoice = <S extends ChoiceSchema<ChoiceSpec>>(
  schema: S,
  input: S['Type'],
  options: SerializeOptions | undefined,
): JsonObject => {
  const { kind, ...rest } = input;
  const variantSchema = schema.spec[kind];

  // XXX: additional checks
  // const keys = Object.keys(rest);
  // if (keys.length === 0) {
  //   return { kind };
  // }

  if (variantSchema === null) {
    return input;
  }

  if (variantSchema!.kind === 'object') {
    const value = serializeObject(variantSchema!, rest, options);
    return value === rest ? input : { kind, ...value };
  }

  const inputValue = (rest as any).value;
  const outputValue = serialize(variantSchema!, inputValue, options);

  return inputValue === outputValue
    ? (input as JsonObject)
    : { kind, value: outputValue };
};
