# BaseFilter

## Install

```shell
npm i @kovalenko/base-filter
```

## Usage

### Filter
```typescript
import {computed, signal} from '@angular/core';
import {debounce, SchemaFn} from '@angular/forms/signals';
import {BaseSignalFilter, FilterProperty, TransformArray, TransformBoolean} from '@kovalenko/base-filter';

export class ListFilter extends BaseSignalFilter {
  static override schema: SchemaFn<ListFilter> = (path) => {
    debounce(path.n, 300);
  };

  @TransformArray()
  id: string[] = [];

  @FilterProperty()
  n = '';

  @TransformArray()
  t: string[] = [];

  @TransformBoolean()
  r: boolean | null = null;

  override readonly key = signal('d').asReadonly();

  override readonly serialized = computed(() => ({
    ...this.serialize(),
    t: this.type ?? this.editable().t,
    haveReport: this.haveReport,
  }));

  type?: string[];

  haveReport?: boolean;
}
```

### Component
```typescript
@Component({
  selector: 'app-test',
  template: '',
})
export class ListRouteComponent {
  readonly filter = new ListFilter(50, inject(ActivatedRoute).queryParams);

  readonly #route = inject(ActivatedRoute);

  readonly #router = inject(Router);

  readonly #d = toSignal(this.#route.queryParams.pipe(map(p => p[this.filter.key()])));

  constructor() {
    effect(() => {
      this.#router.navigate(
        [],
        {
          queryParams: typeof this.#d() === 'string'
            ? {[this.filter.key()]: null}
            : this.filter.q(),
          relativeTo: this.#route,
          queryParamsHandling: 'merge',
        },
      );
    });
  }
}
```

```typescript
@UntilDestroy()
@Component({
  selector: 'app-table',
  template: '',
})
export class TableComponent {
  readonly filter = input.required<ListFilter>();

  readonly busy = signal(false);

  readonly #service = inject(Service);

  #subs?: Subscription;

  constructor() {
    effect(this.#list);
  }

  readonly #list = (): void => {
    this.busy.set(true);

    this.#subs?.unsubscribe();

    this.#subs = this.#service
      .list(this.filter().qsQueryParams())
      .pipe(
        untilDestroyed(this),
      )
      .subscribe();
  };
}
```

## API
API is in d.ts
