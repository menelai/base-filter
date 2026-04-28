import {transformFn} from './transform-fn';

/**
 * Transforms query param to boolean
 * @constructor
 */
export function TransformBoolean(): PropertyDecorator {
  return (object: any, propertyName: string | symbol): void => {
    transformFn(object, propertyName, parser);
  };
}

function parser(v: unknown): any {
  return Array.isArray(v)
    ? v.map(r => toBoolean(r)).filter(r => r != null)
    : toBoolean(v);
}

function toBoolean(v: unknown): boolean | null {
  return v === 'true' || v === 'false' ? v === 'true' : null;
}
