import {SerializeFn} from '../serialize-fn';

import {BaseSignalFilter} from '../base-signal-filter';

/**
 * Defines filter property
 * @param serialize — serialization function, optional
 * @constructor
 */
export function FilterProperty(serialize?: SerializeFn): PropertyDecorator {
  return (object: any, propertyName: string | symbol): void => {
    const c = object.constructor as typeof BaseSignalFilter;
    const p = propertyName as keyof BaseSignalFilter;

    if (!c.filterProperties.has(p)) {
      c.filterProperties.set(p, []);
    }

    if (serialize) {
      c.serializeField.set(p, serialize);
    }
  };
}
