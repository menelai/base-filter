import {SerializeFn} from '../serialize-fn';

/**
 * Defines filter property
 * @param serialize — serialization function, optional
 * @constructor
 */
export function FilterProperty(serialize?: SerializeFn): PropertyDecorator {
  return (object: any, propertyName: string | symbol): void => {
    object.constructor.deletableProperties ??= new Set();
    object.constructor.serializeField ??= new Map();

    object.constructor.deletableProperties.add(propertyName);

    if (serialize) {
      object.constructor.serializeField.set(propertyName, serialize);
    }
  };
}
