import moment from 'moment';
import {transformFn} from '@kovalenko/base-filter';

/**
 * Transforms query param to Moment
 * @constructor
 */
export function TransformMoment(): PropertyDecorator {
  return (object: any, propertyName: string | symbol): void => {
    transformFn(object, propertyName, parser);
  };
}

function parser(value: unknown): any {
  if (value == null) {
    return null;
  }

  const v = moment(value);

  return v.isValid() ? v : null;
}
