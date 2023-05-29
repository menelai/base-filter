import {plainToClass, Type} from 'class-transformer';
import {BehaviorSubject, Observable, map, filter} from 'rxjs';
import {stringify, parse} from 'qs';
import {FilterProperty} from './decorators/filter-property';
import {SerializeFn} from './serialize-fn';

export class BaseFilter {
  /**
   * Optional array of possible page sizes
   */
  static readonly limitOptions?: number[];

  /**
   * query string combining key
   * @protected
   */
  protected static readonly key?: string;

  /**
   * fields to update from query string
   * @protected
   */
  protected static readonly deletableProperties = new Set<symbol | string>();

  /**
   * how to serialize
   * @protected
   */
  protected static readonly serializeField = new Map<keyof BaseFilter, SerializeFn>();

  /**
   * default page in pagination
   * @protected
   */
  protected static defaultPage = 1;

  /**
   * filter page property
   */
  @Type(() => Number)
  @FilterProperty((page: number, ths?: any) => page === ths?.constructor.defaultPage ? null : page.toString())
  page = (this.constructor as any).defaultPage;

  /**
   * filter page property
   */
  @Type(() => Number)
  @FilterProperty((limit?: number, ths?: any) => ths?.constructor.limitOptions ? (limit?.toString() ?? null) : null)
  limit: number;

  /**
   * Observable.
   * Triggers when filter is updated
   */
  updated$!: BehaviorSubject<this>;

  /**
   * Observable. Subscribes to queryParams or to internal Observable
   */
  query$!: Observable<this>;

  /**
   * Items per page
   */
  defaultLimit!: number;

  protected queryParams: any;

  /**
   * how to detect query change
   * @private
   */
  private oldStringify!: string;

  /**
   * Current offset
   */
  get offset(): number {
    return this.page * this.limit;
  }

  /**
   * Constructor
   * @param limit — items per page
   * @param queryParams — query Observable, e.g. Angular ActivatedRoute.queryParams. Optional
   */
  constructor(limit: number, queryParams?: Observable<any>) {
    if (limit !== undefined && (this.constructor as any).limitOptions && !(this.constructor as any).limitOptions.includes(limit)) {
      throw new Error(`invalid limit: ${this.constructor.name} ${limit}: expected ${(this.constructor as any).limitOptions.join(', ')}`);
    }

    Object.defineProperty(this, 'defaultLimit', {
      writable: true,
      enumerable: false,
      value: limit,
    });

    this.limit = limit;

    Object.defineProperty(this, 'updated$', {
      value: new BehaviorSubject(this),
    });
    Object.defineProperty(this, 'query$', {
      value: queryParams ? queryParams.pipe(
        map(() => {
          this.transformParams();
          return this;
        }),
        filter(() => {
          const newStringify = JSON.stringify(this.toJSON());
          if (this.oldStringify !== newStringify) {
            this.oldStringify = newStringify;
            return true;
          }

          return false;
        }),
      ) : this.updated$,
    });
    Object.defineProperty(this, 'queryParams', {
      enumerable: false,
      writable: true,
    });
    Object.defineProperty(this, 'oldStringify', {
      enumerable: false,
      writable: true,
    });
  }

  /**
   * Unset all properties
   */
  clear(): void {
    this.deleteProperties();
    this.changePage(1);
  }

  /**
   * Change page
   * @param pageIndex
   */
  changePage(pageIndex: number): void {
    this.page = pageIndex;
    this.updated();
  }

  /**
   * Update trigger
   */
  updated(): void {
    this.updated$.next(this);
  }

  /**
   * serialization
   */
  toJSON(): Record<string, any> {
    return {
      ...this.toQueryParams(),
      limit: this.limit,
    }
  }

  /**
   * Convert for angular router
   */
  toQueryParams(): Record<string, any> {
    return [...(this.constructor as any).deletableProperties].reduce((ret, key: keyof this) => {
      const serializeFn = (this.constructor as any).serializeField.get(key);
      ret[(this.constructor as any).key ? `${(this.constructor as any).key}[${key as string}]` : key] = serializeFn ? serializeFn(this[key], this) : this[key];

      return ret;
    }, {});
  }

  /**
   * Convert to query string
   */
  qsStringify(): string {
    const obj = (this.constructor as any).key ? {[(this.constructor as any).key]: this.toJSON()} : this.toJSON();

    return stringify(obj,{skipNulls: true});
  }

  /**
   * default query transformation
   * @protected
   */
  protected transformParams(): void {
    this.queryParams = parse(location.search.slice(1));
    if ((this.constructor as any).key) {
      this.queryParams = this.queryParams[(this.constructor as any).key] ?? {};
    }
    this.deleteProperties();

    this.page = Number(this.queryParams.page) || (this.constructor as any).defaultPage;

    const params = {...this.queryParams} as Record<any, any>;
    params['limit'] = (this.constructor as any).limitOptions && (this.constructor as any).limitOptions.includes(Number(params['limit'])) ? Number(params['limit']) : this.defaultLimit;

    const joj = plainToClass(this.constructor as any, params, {enableImplicitConversion: true});

    Object.assign(this, joj);
  }

  /**
   * Clears filter properties
   * @protected
   */
  protected deleteProperties(): void {
    (this.constructor as any).deletableProperties.forEach((property: string) => {
      delete (this as any)[property];
    });
  }
}
