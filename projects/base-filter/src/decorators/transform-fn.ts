import {BaseSignalFilter} from '../base-signal-filter';

export function transformFn(object: any, propertyName: string | symbol, parser: (v: unknown) => any): void {
  const ctor = object.constructor as typeof BaseSignalFilter;

  if (!Object.prototype.hasOwnProperty.call(ctor, 'filterProperties')) {
    const parentProps = (ctor as any).filterProperties ?? [];
    Object.defineProperty(ctor, 'filterProperties', {
      value: new Map(parentProps),
      writable: true,
    });
  }

  const p = propertyName as keyof BaseSignalFilter;

  let parsers = ctor.filterProperties.get(p);
  if (!parsers) {
    parsers = [];
    ctor.filterProperties.set(p, parsers);
  }

  parsers.push(parser);
}
