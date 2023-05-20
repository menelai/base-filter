import {Transform} from 'class-transformer';

/**
 * Transforms query param to array
 * @constructor
 */
export function TransformArray(): PropertyDecorator {
  return Transform(({value}) => Array.isArray(value) ? value: [value]);
}
