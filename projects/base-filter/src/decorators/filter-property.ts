export function FilterProperty(): PropertyDecorator {
  return (object: any, propertyName: string | symbol): void => {
    if (object.constructor.deletableProperties == null) {
      console.log('No static field `deletableProperties`');
    }
    object.constructor.deletableProperties.add(propertyName);
  };
}
