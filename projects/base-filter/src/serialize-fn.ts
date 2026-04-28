import {BaseSignalFilter} from './base-signal-filter';

/**
 * serialize filter field
 */
export type SerializeFn = (v: any, ths?: BaseSignalFilter) => string | string[] | null;
