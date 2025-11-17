export interface State {
  deps: Map<string, Set<string>>;
  defs: Map<string, string>;
}

export type Code =
  | { kind: 'id' }
  | { kind: 'defined'; id: number | string }
  | { kind: 'external'; name: string }
  | { kind: 'inline'; code: string }
  | { kind: 'template'; arg: string; body: string };

export const resolveCode = (code: Code, arg: string): string => {
  if (code.kind === 'id') {
    return arg;
  } else if (code.kind === 'defined') {
    return `${code.id}(${arg})`;
  } else if (code.kind === 'external') {
    return `${code.name}(${arg})`;
  } else if (code.kind === 'inline') {
    return `(${code.code})(${arg})`;
  } else {
    return `${code.body.replaceAll(`$${code.arg}`, arg)}`;
  }
};

export const addDependency = (state: State, path: string, name: string) => {
  let deps = state.deps.get(path);
  if (!deps) {
    deps = new Set();
    state.deps.set(path, deps);
  }
  deps.add(name);
};

export const compileModule = (state: State) => {
  const head: string[] = [];
  const tail: string[] = [];

  for (const [key, value] of state.deps.entries()) {
    const imports = [...value].join(', ');
    head.push(`import { ${imports} } from '${key}';`);
  }

  if (head.length > 0) {
    head.push('\n');
  }

  for (const [id, value] of state.defs.entries()) {
    tail.push(`const ${id} = ${value}`);
  }

  return head.join('\n') + tail.join('\n\n');
};
