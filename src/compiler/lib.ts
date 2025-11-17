export function setCowProperty(
  input: Record<string, unknown>,
  output: { value: Record<string, unknown> | undefined },
  key: string,
  fn: (input: unknown) => unknown,
): void {
  const value = input[key];
  if (value === undefined) {
    throw Error(`missing property "${key}"`);
  }
  const result = fn(value);
  if (output.value) {
    output.value[key] = result;
  } else if (value !== result) {
    output.value = { ...input };
    output.value[key] = result;
  }
}
