export type Json = JsonPrimitive | Json[] | JsonObject;
export type JsonPrimitive = null | boolean | number | string;
export type JsonObject = { [key: string]: Json };

export type InterfaceToJson<T extends object> = {
  [K in keyof T]: T[K] extends Json
    ? T[K]
    : T[K] extends object
      ? InterfaceToJson<T[K]>
      : never;
};

export function isJsonPrimitive(json: Json): json is JsonPrimitive {
  return (
    json === null ||
    typeof json === 'boolean' ||
    typeof json === 'number' ||
    typeof json === 'string'
  );
}

export const isNull = (json: Json): json is boolean => {
  return json === null;
};

export const isBoolean = (json: Json): json is boolean => {
  return typeof json === 'boolean';
};

export const isNumber = (json: Json): json is number => {
  return typeof json === 'number';
};

export const isString = (json: Json): json is string => {
  return typeof json === 'string';
};

export const isArray = (json: Json): json is Json[] => {
  return Array.isArray(json);
};

export const isObject = (json: Json): json is JsonObject => {
  return typeof json === 'object' && json !== null && !Array.isArray(json);
};

export function assertNull(json: Json): asserts json is null {
  if (!isNull(json)) {
    throw new Error('invalid type');
  }
}

export function assertBoolean(json: Json): asserts json is boolean {
  if (!isBoolean(json)) {
    throw new Error('invalid type');
  }
}

export function assertNumber(json: Json): asserts json is number {
  if (!isNumber(json)) {
    throw new Error('invalid type');
  }
}

export function assertString(json: Json): asserts json is string {
  if (!isString(json)) {
    throw new Error('invalid type');
  }
}

export function assertArray(json: Json): asserts json is Json[] {
  if (!isArray(json)) {
    throw new Error('invalid type');
  }
}

export function assertObject(json: Json): asserts json is JsonObject {
  if (!isObject(json)) {
    throw new Error('invalid type');
  }
}

export const parseNull = (json: Json): null => {
  assertNull(json);
  return json;
};

export const parseBoolean = (json: Json): boolean => {
  assertBoolean(json);
  return json;
};

export const parseString = (json: Json): string => {
  assertString(json);
  return json;
};

export const parseNumber = (json: Json): number => {
  assertNumber(json);
  return json;
};

export const parseArray = (json: Json): Json[] => {
  assertArray(json);
  return json;
};

export const parseLength = (json: Json, length: number): Json[] => {
  assertArray(json);
  if (json.length !== length) {
    throw new Error('invalid length');
  }
  return json;
};

export const parseObject = (json: Json): JsonObject => {
  assertObject(json);
  return json;
};
