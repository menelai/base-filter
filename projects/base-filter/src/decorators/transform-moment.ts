import {Transform} from 'class-transformer';
import moment from 'moment';

/**
 * Transforms query param to Moment
 * @constructor
 */
export function TransformMoment(): PropertyDecorator {
  return Transform(({value}) => {
    if (value == null) {
      return value;
    }

    const v = moment(value);

    return v.isValid() ? v : undefined;
  });
}
