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
    return v.map(r => Number(r)).filter(r => !isNaN(r));
  } else {
    v = Number(v);
    return isNaN(v as number) ? null : v;
  }
}
