import type { SerializeOptions } from '../runtime/serialize';
import type { AnySchema } from '../schema';
import type {
  ArraySchema,
  ObjectSchema,
  ObjectSpec,
  OptionSchema,
  TupleSchema,
} from '../schemas';
import type { ChoiceSchema, ChoiceSpec } from '../schemas/choice';
import type { Code, State } from './codegen';
import { addDependency, resolveCode } from './codegen';
import { willAlwaysCopy } from './cow';

export const compileSerialize = (
  schema: AnySchema,
  state: State,
  options: SerializeOptions | undefined,
): Code => {
  const rec = (schema: AnySchema): Code => {
    return compileSerialize(schema, state, options);
  };

  switch (schema.kind) {
    case 'bool':
    case 'string':
    case 'int':
    case 'u32':
    case 'i32':
    case 'json':
      return { kind: 'id' };

    case 'number':
      if (options?.numberPassthrough) {
        return { kind: 'id' };
      } else {
        addDependency(state, 'typekind/runtime', 'serializeNumber');
        return {
          kind: 'external',
          name: 'serializeNumber',
        };
      }

    case 'bigint':
    case 'u64':
    case 'i64':
      return {
        kind: 'template',
        arg: 'input',
        body: '$input.toString()',
      };

    case 'date':
      if (options?.dateTimePassthrough) {
        return { kind: 'id' };
      } else {
        return { kind: 'template', arg: 'input', body: '$input.toISOString()' };
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
        return { kind: 'id' };
      } else {
        return { kind: 'template', arg: 'input', body: '$input.toString()' };
      }

    case 'option': {
      const s = schema as OptionSchema<AnySchema>;
      const spec = rec(s.spec);
      if (spec.kind === 'id') {
        return { kind: 'id' };
      } else {
        return {
          kind: 'template',
          arg: 'input',
          body: `$input === void 0 ? void 0 : ${resolveCode(spec, '$input')}`,
        };
      }
    }

    case 'array': {
      const s = schema as ArraySchema<AnySchema>;
      const spec = rec(s.spec);
      if (spec.kind === 'id') {
        return { kind: 'id' };
      } else {
        const cow = options?.cow && !willAlwaysCopy(schema);
        if (cow) {
          addDependency(state, 'cow', 'mapCow');
          return {
            kind: 'template',
            arg: 'input',
            body: `mapCow($input, item => ${resolveCode(spec, 'item')})`,
          };
        } else {
          return {
            kind: 'template',
            arg: 'input',
            body: `$input.map(item => ${resolveCode(spec, 'item')})`,
          };
        }
      }
    }

    case 'tuple': {
      const s = schema as TupleSchema<AnySchema[]>;
      const specs = s.spec.map(rec);
      const elements = specs.map((spec, i) =>
        resolveCode(spec, `$input[${i}]`),
      );
      const shouldCollapse = specs.every(spec => spec.kind === 'id');
      if (shouldCollapse) {
        return { kind: 'id' };
      } else {
        return {
          kind: 'template',
          arg: 'input',
          body: `[${elements.join(', ')}]`,
        };
      }
    }

    case 'object':
      return compileObject(schema, state, options);

    case 'choice':
      return compileChoice(schema, state, options);

    default:
      throw Error(`compilation not implemented for "${schema.kind}"`);
  }
};

const compileObject = (
  schema: ObjectSchema<ObjectSpec>,
  state: State,
  options: SerializeOptions | undefined,
): Code => {
  const s = schema as ObjectSchema<ObjectSpec>;
  const lines: string[] = [];
  const cow = options?.cow && !willAlwaysCopy(schema);

  lines.push(`input => {`);

  if (cow) {
    lines.push(`  const output = {};`);
  } else {
    lines.push(`  const copy = { ...input };`);
  }

  let shouldCollapse = true;

  for (const [key, specSchema] of Object.entries(s.spec)) {
    const serializer = compileSerialize(specSchema, state, options);
    if (serializer.kind !== 'id') {
      shouldCollapse = false;

      const expr = `copy.${key}`;
      const result = resolveCode(serializer, expr);

      if (cow) {
        addDependency(state, 'cow', 'setCowProperty');
        lines.push(`  setCowProperty(input, output, '${key}', ${result});`);
      } else {
        lines.push(`  ${expr} = ${result};`);
      }
    }
  }

  if (shouldCollapse) {
    return { kind: 'id' };
  }

  if (cow) {
    lines.push(`  return output.value ?? input;`);
  } else {
    lines.push(`  return copy;`);
  }

  lines.push(`};`);

  const code = lines.join('\n');
  const id = `serialize_${state.defs.size}`;
  state.defs.set(id, code);

  return { kind: 'defined', id };
};

const compileChoice = (
  schema: ChoiceSchema<ChoiceSpec>,
  state: State,
  options: SerializeOptions | undefined,
): Code => {
  const s = schema as ChoiceSchema<ChoiceSpec>;
  const lines: string[] = [];

  lines.push(`input => {`);
  lines.push(`  const { kind, ...rest } = input;`);

  let shouldCollapse = true;
  let shouldSpread = false;
  let i = 0;

  for (const [key, specSchema] of Object.entries(s.spec)) {
    if (i === 0) {
      lines.push(`  if (kind === '${key}') {`);
    } else {
      lines.push(`  } else if (kind === '${key}') {`);
    }
    i += 1;

    if (specSchema === null) {
      lines.push(`    return input;`);
    } else if (specSchema.kind === 'object') {
      const serializer = compileSerialize(specSchema, state, options);
      if (serializer.kind === 'id') {
        lines.push(`    return input;`);
      } else {
        shouldCollapse = false;
        shouldSpread = true;

        const result = resolveCode(serializer, 'rest');
        lines.push(`    const serialized = ${result};`);
        lines.push(`    return { kind, ...serialized };`);
      }
    } else {
      const serializer = compileSerialize(specSchema, state, options);
      if (serializer.kind !== 'id') {
        shouldCollapse = false;
      }
      const result = resolveCode(serializer, 'input.value');
      lines.push(`    return { kind, value: ${result} };`);
    }
  }

  if (!options?.choiceFallthrough) {
    lines.push(`  } else {`);
    lines.push(`    throw new Error('unknown kind');`);
  }

  lines.push(`  }`);
  lines.push(`};`);

  if (!shouldSpread) {
    lines[1] = `  const { kind } = input;`;
  }

  if (shouldCollapse) {
    return { kind: 'id' };
  }

  const code = lines.join('\n');
  const id = `serialize_${state.defs.size}`;
  state.defs.set(id, code);

  return { kind: 'defined', id };
};
