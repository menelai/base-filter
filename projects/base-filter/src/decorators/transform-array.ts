import {transformFn} from './transform-fn';

/**
 * Transforms query param to array
 * @constructor
 */
export function TransformArray(): PropertyDecorator {
  return (object: any, propertyName: string | symbol): void => {
    transformFn(object, propertyName, parser);
  };
}

function parser(v: unknown): any {
  if (v == null) {
    return null;
  }
  return [...new Set(Array.isArray(v) ? v : [v])];
}
