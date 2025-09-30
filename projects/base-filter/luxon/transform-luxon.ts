import {Transform} from 'class-transformer';
import {DateTime} from 'luxon';

export function TransformLuxon(): PropertyDecorator {
  return Transform(({value}) => {
    if (value == null) {
      return value;
    }

    const v = DateTime.fromISO(value);

    return v.isValid ? v : undefined;
  });
}
