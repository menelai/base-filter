import {Transform} from 'class-transformer';

export function TransformArray(): PropertyDecorator {
  return Transform(({value}) => Array.isArray(value) ? value: [value]);
}
