import {transformFn} from './transform-fn';

/**
 * Transforms query param to number
 * @constructor
 */
export function TransformNumber(): PropertyDecorator {
  return (object: any, propertyName: string | symbol): void => {
    transformFn(object, propertyName, parser);
  };
}

function parser(v: unknown): any {
  if (Array.isArray(v)) {
    return v.filter(r => r != null && !isNaN(Number(r))).map(r => Number(r));
  } else {
    return v == null || isNaN(Number(v)) ? null : Number(v);

  }
}
