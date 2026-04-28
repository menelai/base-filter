# @kovalenko/base-filter

Signal-based Angular filter that syncs with URL query params via `qs`.

## Requirements

- Angular >= 21
- `@angular/forms/signals` (experimental signals-based forms API)

## Install

```shell
npm i @kovalenko/base-filter
```

Peer dependencies:

```shell
npm i qs
```

## Overview

`BaseSignalFilter` is a base class for typed URL filters. It:

- reads query params from the URL (via `qs`) and populates filter fields
- serializes filter state back to query params
- integrates with `@angular/forms/signals` for reactive form binding
- tracks `page` and `limit` automatically
- exposes computed signals for use in components and HTTP requests

## Basic usage

### 1. Define a filter class

```typescript
import {computed, signal} from '@angular/core';
import {debounce, SchemaFn} from '@angular/forms/signals';
import {
  BaseSignalFilter,
  FilterProperty,
  TransformArray,
  TransformBoolean,
  TransformNumber,
} from '@kovalenko/base-filter';

export class ListFilter extends BaseSignalFilter {
  // Optional: configure field-level form schema (e.g. debounce)
  static override schema: SchemaFn<ListFilter> = (path) => {
    debounce(path.name, 300);
  };

  // Registered as a filter field, parsed as string[]
  @TransformArray()
  ids: string[] = [];

  // Registered as a filter field, plain string (with 300ms debounce via schema)
  @FilterProperty()
  name = '';

  // Parsed as boolean | null ('true' → true, 'false' → false, anything else → null)
  @TransformBoolean()
  active: boolean | null = null;

  // Parsed as number | null
  @TransformNumber()
  categoryId: number | null = null;

  // Namespace key: query params will be nested under ?f[ids]=...&f[name]=...
  override readonly key = signal('f').asReadonly();

  // Override serialized to inject extra fields that aren't filter inputs
  override readonly serialized = computed(() => ({
    ...this.serialize(),
    type: this.fixedType,
  }));

  // Fields set externally, not from URL
  fixedType?: string;
}
```

### 2. Use in a route component

```typescript
import {Component, effect, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';

@Component({
  selector: 'app-list',
  template: '',
})
export class ListRouteComponent {
  readonly filter = new ListFilter(25, inject(ActivatedRoute).queryParams);

  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);

  // Watch for the filter's namespace key in query params
  readonly #q = toSignal(
    this.#route.queryParams.pipe(map(p => p[this.filter.key()])),
  );

  constructor() {
    effect(() => {
      this.#router.navigate([], {
        queryParams: typeof this.#q() === 'string'
          ? {[this.filter.key()]: null}
          : this.filter.q(),
        relativeTo: this.#route,
        queryParamsHandling: 'merge',
      });
    });
  }
}
```

### 3. Use in a data component

```typescript
import {Component, effect, inject, input, signal} from '@angular/core';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-table',
  template: '',
})
export class TableComponent {
  readonly filter = input.required<ListFilter>();
  readonly busy = signal(false);

  readonly #service = inject(MyService);
  #subs?: Subscription;

  constructor() {
    effect(this.#load);
  }

  readonly #load = (): void => {
    this.busy.set(true);
    this.#subs?.unsubscribe();

    // qsQueryParams() returns an HttpParams-compatible object serialized with qs
    this.#subs = this.#service
      .list(this.filter().qsQueryParams())
      .subscribe(data => {
        this.busy.set(false);
        // handle data
      });
  };
}
```

## Constructor

```typescript
new ListFilter(defaultLimit, queryParams?)
```

| Parameter | Type | Description |
|---|---|---|
| `defaultLimit` | `number \| undefined` | Default page size. Pass `undefined` to disable pagination. |
| `queryParams` | `Observable<any>` | Typically `ActivatedRoute.queryParams`. When provided, the filter will reactively parse the URL on every change. |

If `defaultLimit` is provided and `limitOptions` is non-empty, the value must be included in `limitOptions` — otherwise an error is thrown.

## API

### Signals & computed

| Member | Type | Description |
|---|---|---|
| `key` | `Signal<string>` | Namespace key for query params. Override to nest params: `?key[field]=value`. Empty string means no nesting. |
| `page` | `WritableSignal<number>` | Current page. Resets to `defaultPage` (1) on filter change. |
| `limit` | `WritableSignal<number \| null>` | Current page size. |
| `limitOptions` | `Signal<number[]>` | Override to restrict allowed page sizes. |
| `editable` | `WritableSignal<this>` | Current editable state of filter fields (excludes `form` itself). |
| `form` | `FieldTree<this>` | Signals-based form tree for binding inputs. |
| `query` | `Signal<any>` | Raw query params signal (from `queryParams` observable). |
| `serialized` | `Signal<Record<string, any>>` | Serialized filter state. Override to add computed/external fields. |
| `q` | `Signal<Record<string, any>>` | Query params object ready for `Router.navigate`. Respects `key` namespacing. |
| `qsQueryParams` | `Signal<QsHttpParams>` | `HttpParams`-compatible object serialized with `qs` (array brackets format). Pass to `HttpClient` methods. |
| `isEmpty` | `Signal<boolean>` | `true` when all filter fields are empty (ignores `page` and `limit`). |

### Decorators

Decorators register fields for URL parsing and serialization. They must be applied to class properties.

#### `@FilterProperty(serialize?)`

Registers a plain filter field. Optionally accepts a custom `SerializeFn` for serialization.

```typescript
@FilterProperty()
search = '';

// With custom serialization
@FilterProperty(v => v?.toUpperCase() ?? null)
status = '';
```

#### `@TransformArray()`

Wraps a single query param value in an array. Ensures the field is always `T[] | null` regardless of whether the URL contains one or multiple values.

```typescript
@TransformArray()
ids: string[] = [];
```

#### `@TransformBoolean()`

Parses `'true'` → `true`, `'false'` → `false`, anything else → `null`. Also handles arrays of booleans.

```typescript
@TransformBoolean()
active: boolean | null = null;
```

#### `@TransformNumber()`

Parses string to number. Returns `null` for `NaN`. Handles arrays of numbers (filters out `NaN` values).

```typescript
@TransformNumber()
categoryId: number | null = null;
```

### Types

```typescript
// Custom parse function for a field
type ParseFn = (v: any, filter?: BaseSignalFilter) => any;

// Custom serialize function for a field
type SerializeFn = (v: any, filter?: BaseSignalFilter) => string | string[] | null;
```

### `QsHttpParams`

Extends `HttpParams`. Serializes to a query string using `qs` with `arrayFormat: 'brackets'`.

```typescript
// ?ids[]=1&ids[]=2 instead of ?ids=1&ids=2
this.http.get('/api/list', {params: this.filter.qsQueryParams()});
```

## Entry points

### `@kovalenko/base-filter/luxon`

Provides `TransformLuxon` — parses a query param ISO string into a `luxon` `DateTime`. Returns `null` for invalid or missing values.

```shell
npm i luxon
npm i -D @types/luxon
```

```typescript
import {TransformLuxon} from '@kovalenko/base-filter/luxon';

export class ReportFilter extends BaseSignalFilter {
  @TransformLuxon()
  from: DateTime | null = null;

  @TransformLuxon()
  to: DateTime | null = null;
}
```

### `@kovalenko/base-filter/moment`

Provides `TransformMoment` — parses a query param string into a `moment` object. Returns `null` for invalid or missing values.

```shell
npm i moment
```

```typescript
import {TransformMoment} from '@kovalenko/base-filter/moment';

export class ReportFilter extends BaseSignalFilter {
  @TransformMoment()
  from: moment.Moment | null = null;
}
```

## `tsconfig.json` requirements

Secondary entry points (`/luxon`, `/moment`) and Angular subpath imports require `moduleResolution: bundler`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "module": "ES2022",
    "target": "ES2022"
  }
}
```

## License

MIT
