import {Type} from 'class-transformer';
import {BehaviorSubject, Observable, map, filter} from 'rxjs';
import {stringify, parse} from 'qs';

export class BaseFilter {
  static readonly deletableProperties = new Set<symbol | string>();

  static readonly key?: string;

  @Type(() => Number)
  page = 1;

  updated$!: BehaviorSubject<this>;

  query$!: Observable<this>;

  limit: number;

  protected queryParams: any;

  private oldStringify!: string;

  get offset(): number {
    return this.page * this.limit;
  }

  constructor(limit: number, queryParams?: Observable<any>) {
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

  clear(): void {
    this.deleteProperties();
    this.changePage(1);
  }

  changePage(pageIndex: number): void {
    this.page = pageIndex;
    this.updated();
  }

  updated(): void {
    this.updated$.next(this);
  }

  toJSON(): this {
    return {
      ...this,
      page: this.page === 1 ? null : this.page,
    };
  }

  qsStringify(): string {
    return stringify(this.toJSON(), {skipNulls: true});
  }

  protected transformParams(): void {
    this.queryParams = parse(location.search.slice(1));
    this.page = Number(this.queryParams.page) || 1;
    this.deleteProperties();
  }

  protected deleteProperties(): void {
    (this.constructor as any).deletableProperties.forEach((property: string) => {
      delete (this as any)[property];
    });
  }
}
