import {computed, effect, Signal, signal, WritableSignal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FieldTree, form, SchemaFn} from '@angular/forms/signals';
import {parse} from 'qs';
import {Observable} from 'rxjs';

import {ParseFn} from './parse-fn';
import {QsHttpParams} from './qs-http-params';
import {SerializeFn} from './serialize-fn';

export class BaseSignalFilter {
  /**
   * fields to update from query string
   * @protected
   */
  static readonly filterProperties = new Map<keyof BaseSignalFilter, ParseFn[]>();

  /**
   * how to serialize
   * @protected
   */
  static readonly serializeField = new Map<keyof BaseSignalFilter, SerializeFn>();

  protected static defaultPage = 1;

  static schema: SchemaFn<any> = () => {};

  readonly key = signal('').asReadonly();

  readonly limitOptions = signal<number[]>([]).asReadonly();

  readonly page = signal((this.constructor as typeof BaseSignalFilter).defaultPage);

  readonly limit: WritableSignal<number>;

  readonly query: Signal<any>;

  declare readonly form: FieldTree<Omit<typeof this, 'editable' | 'form'>>;

  declare readonly editable: WritableSignal<Omit<typeof this, 'editable' | 'form'>>;

  readonly q = computed(() => this.toQueryParams());

  readonly serialized = computed(() => this.serialize());

  readonly isEmpty = computed(() => {
    const serialized = {
      ...this.serialized(),
      page: null,
      limit: null,
    };

    return Object
      .values(serialized)
      .every((v: unknown) =>
        Array.isArray(v)
          ? v.length === 0 || v.every(m => typeof m === 'number' || typeof m === 'boolean' ? false : !m)
          : typeof v === 'number' || typeof v === 'boolean' ? false : !v,
      );
  });

  readonly qsQueryParams = computed(() =>
    new QsHttpParams(
      {
        ...this.serialized(),
        limit: this.limit(),
        page: this.page(),
      },
      {
        skipNulls: true,
      },
    ),
  );

  constructor(
    private readonly defaultLimit: number | undefined,
    queryParams?: Observable<any>,
  ) {
    if (
      defaultLimit !== undefined
      && this.limitOptions().length
      && !this.limitOptions().includes(defaultLimit)
    ) {
      throw new Error(`invalid limit: ${this.constructor.name} ${defaultLimit}: expected ${(this.constructor as any).limitOptions.join(', ')}`);
    }

    this.limit = signal(defaultLimit ?? 0);
    this.query = queryParams ? toSignal(queryParams) : signal(null).asReadonly();

    if (this.defaultLimit !== undefined) {
      this.editable = signal<typeof this>(this.serialize() as any, {
        equal: (a, b) => JSON.stringify(a) === JSON.stringify(b),
      });

      this.form = this.createFrom() as any;

      effect(() => {
        this.transformParams();
      });

      let firstChange = true;
      effect(() => {
        if (this.editable()) {
          if (firstChange) {
            firstChange = false;
          } else {
            this.page.set((this.constructor as typeof BaseSignalFilter).defaultPage);
          }
        }
      });
    }
  }

  toQueryParams(): Record<string, any> {
    const ret = this.serialize();

    return Object
      .entries(ret)
      .reduce(
        (r, [key, value]) => {
          const k = !this.key()
            ? key
            : `${this.key()}[${key as string}]`;

          const v = typeof value === 'boolean' || typeof value === 'number'
            ? value
            : value || null;

          r[k] = v;

          return r;
        },
        {} as Record<string, any>,
      );

  }

  protected transformParams(): void {
    if (!this.query()) {
      this.limit.set(this.defaultLimit ?? 0);
      this.page.set((this.constructor as typeof BaseSignalFilter).defaultPage);
      const fields = {} as Record<string, any>;

      for (const [key] of (this.constructor as typeof BaseSignalFilter).filterProperties.entries()) {
        fields[key] = this[key];
      }

      this.editable.set(fields as any);
      return;
    }

    let queryParams = parse(location.search.slice(1)) as Record<string, any>;
    if (this.key()) {
      queryParams = queryParams[this.key()] ?? {};
    }

    this.page.set(Number(queryParams['page']) || (this.constructor as typeof BaseSignalFilter).defaultPage);
    this.limit.set(
      this.limitOptions().includes(Number(queryParams['limit']))
        ? Number(queryParams['limit'])
        : this.defaultLimit ?? 0,
    );

    const fields = {} as Record<string, any>;

    for (const [key, parsers] of (this.constructor as typeof BaseSignalFilter).filterProperties.entries()) {
      fields[key] = (queryParams[key] as any) ?? this[key];
      for (const parser of parsers) {
        fields[key] = parser(fields[key]);
      }
    }

    this.editable.set(fields as any);
  }

  protected serialize(): Record<string, any> {
    return [...(this.constructor as typeof BaseSignalFilter).filterProperties.keys()].reduce(
      (ret, key) => {
        const property = this.editable ? (this.editable() as any)[key] : this[key];

        return {
          ...ret,
          [key]: property,
        };
      },
      {
        page: (this.constructor as typeof BaseSignalFilter).defaultPage === this.page() ? null : this.page().toString(),
        limit: this.limitOptions().length ? (this.limit()?.toString() ?? null) : null,
      },
    );
  }

  protected createFrom(): FieldTree<Omit<typeof this, 'editable' | 'form'>> {
    return form(this.editable, (this.constructor as typeof BaseSignalFilter).schema);
  }
}
