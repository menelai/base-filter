import {SerializeFn} from '../serialize-fn';

/**
 * Defines filter property
 * @param serialize — serialization function, optional
 * @constructor
 */
export function FilterProperty(serialize?: SerializeFn): PropertyDecorator {
  return (object: any, propertyName: string | symbol): void => {
    if (object.constructor.deletableProperties == null) {
      console.log('No static field `deletableProperties`');
    }
    object.constructor.deletableProperties.add(propertyName);

    if (serialize) {
      object.constructor.serializeField.set(propertyName, serialize);
    }
  };
}
