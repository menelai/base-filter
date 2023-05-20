import {Transform} from 'class-transformer';

/**
 * Transforms query param to boolean
 * @constructor
 */
export function TransformBoolean(): PropertyDecorator {
  return Transform(({value}) => {
    if (value == null) {
      return value;
    }
    if (value === 'true' || value === 'false') {
      return value === 'true';
    }

    return undefined;
  });
}
