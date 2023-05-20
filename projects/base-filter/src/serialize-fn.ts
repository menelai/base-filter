import {BaseFilter} from './base-filter';

/**
 * serialize filter field
 */
export type SerializeFn = (v: any, ths?: BaseFilter) => string | string[] | null;
