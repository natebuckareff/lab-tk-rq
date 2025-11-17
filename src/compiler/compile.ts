import type { SerializeOptions } from '../runtime/serialize';
import type { AnySchema } from '../schema';
import type { State } from './codegen';
import { compileModule, resolveCode } from './codegen';
import { compileSerialize } from './compile-serialize';

export const compileDefinedSchema = (
  name: string,
  schema: AnySchema,
  options?: SerializeOptions,
) => {
  const state: State = {
    deps: new Map(),
    defs: new Map(),
  };

  const serializeFast = compileSerialize(schema, state, options);
  const module = compileModule(state);

  const lines: string[] = [];

  lines.push(
    `export const serializeFast_${name} = input => ${resolveCode(serializeFast, 'input')};`,
    // `export const deserializeFast_${name} = input => ${resolveCode(deserializeFast, 'input')};`,
  );

  if (module.length > 0) {
    return `${module}\n\n${lines.join('\n')}`;
  } else {
    return lines.join('\n');
  }
};
