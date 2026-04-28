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
  return Array.isArray(v) || v == null ? v : [v];
}
