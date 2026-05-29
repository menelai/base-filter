import {SerializeFn} from '../serialize-fn';

import {BaseSignalFilter} from '../base-signal-filter';
import {transformFn} from '@kovalenko/base-filter/src';

/**
 * Defines filter property
 * @param serialize — serialization function, optional
 * @constructor
 */
export function FilterProperty(serialize?: SerializeFn): PropertyDecorator {
  return (object: any, propertyName: string | symbol): void => {
    const ctor = transformFn(object, propertyName, v => v);

    const p = propertyName as keyof BaseSignalFilter;

    if (serialize) {
      ctor.serializeField.set(p, serialize);
    }
  };
}
