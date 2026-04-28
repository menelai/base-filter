import {BaseSignalFilter} from '../base-signal-filter';

export function transformFn(object: any, propertyName: string | symbol, parser: (v: unknown) => any): void {
  const c = object.constructor as typeof BaseSignalFilter;
  const p = propertyName as keyof BaseSignalFilter;

  let parsers = c.filterProperties.get(p);
  if (!parsers) {
    parsers = [];
    c.filterProperties.set(p, parsers);
  }

  parsers.push(parser);
}
