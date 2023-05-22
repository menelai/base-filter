# BaseFilter

## Install

```shell
npm i @kovalenko/base-filter
```

## Setup

add import to polyfills.ts
```typescript
import 'reflect-metadata';
```

## Usage

### Class BaseFilter

#### Protected static properties

##### key?: string
If set then query params will pe parsed from the key in query string. E.g.:

```typescript
class MyFilter extends BaseFilter {
  protected static readonly key = 't';
}
```

##### defaultPage = 1
Default pagination page number

https://path/to?t[param]=test is parsed into `{param: 'test'}`

#### Constructor
```typescript
constructor(limit: number, queryParams?: Observable<any>)
```
`limit`: items per page

`queryParams` — query Observable, e.g. Angular ActivatedRoute.queryParams. 
Optional, sets `query$` property. 
If omitted, the filter will be updated via internal observable `update$`.

#### Public properties

##### updated$: Observable
readonly. Triggers when filter is being updated.

##### query$: Observable
readonly. Observes query params or internal changes.

##### page: number
Current pagination page. Updates from query string

##### limit: number
items per page.

##### offset: number
getter for current pagination offset: `page * limit`.

#### Public methods

##### clear(): void
clears all filter properties and changes the page to first.

##### changePage(pageIndex: number): void
changes filter page to `pageIndex`

##### updated(): void
triggers filter update

##### toJSON(): Record
returns a record of filter properties decorated with `@FilterProperty`

##### toQueryParams(): Record
returns a record of filter properties decorated with `@FilterProperty` for angular router, excluding limit

#### Protected methods

##### transformParams(): void
default query params transformation

##### deleteProperties(): void
default filter properties deletion

### Decorators

#### @FilterProperty(serialize?: SerializeFn): PropertyDecorator
Declares filter property which will be updated from query string.

Optionally in `serialize` there can be transformation for query param.

```typescript
@FilterProperty((v?: number) => v?.toString())
```

#### @TransformBoolean(): PropertyDecorator
Transforms query param into boolean.

https://path/to?param=true becomes `{param: true}`

#### @TransformArray(): PropertyDecorator
Transforms query param into an array.

https://path/to?param=test becomes `{param: ['test']}`

#### @TransformMoment(): PropertyDecorator
Transforms date param into moment.js object.

https://path/to?date=2020-10-10 becomes `{param: Moment}`


### QsHttpParams
Class extending @angular/common/http/HttpParams to pass filter into angular http client.

### Example

```typescript
this.http.get('api/v1/test', {params: new QsHttpParams(filter.toJSON())});
```

#### Filter
```typescript
import {BaseFilter} from '@kovalenko/base-filter';

export class TestFilter extends BaseFilter {
  @FilterProperty()
  title?: string;

  @FilterProperty()
  @TransformBoolean()
  hasParticipants?: boolean;

  @Type(() => Number)
  @TransformArray()
  @FilterProperty()
  campaign?: number[];

  @TransformMoment()
  @TransformArray()
  @FilterProperty((v: moment.Moment[]) => v?.map(ts => ts.format('YYYY-MM')))
  submittedAtFrom?: moment.Moment[];
}
```


#### Service
```typescript
import type {TestFilter} from './test-filter';
import {QsHttpParams} from '@kovalenko/base-filter';

@Injectable()
export class PersonService {

  constructor(
    private http: HttpClient,
  ) { }

  list(flt: TestFilter): Observable<any> {
    return this.http.get('api/v1/test', {
      params: new QsHttpParams(flt.toJSON()),
    });
  }
}
```


#### Component
```typescript
import {ActivatedRoute} from '@angular/router';
import {PersonService} from './person.service';
import {TestFilter} from './test-filter';

@Component({
  selector: 'some-component',
  template: 'hi',
})
export class ApplicationListComponent implements OnInit, OnDestroy {
  loading = false;

  filter = new TestFilter(100, this.route.queryParams);

  constructor(
    private route: ActivatedRoute,
    private personService: PersonService,
  ) { }

  ngOnInit(): void {
    this.filter.updated$.pipe(
      skip(1),
    ).subscribe(f => {
      this.router.navigate([], {
        queryParams: f.toQueryParams(),
        relativeTo: this.route,
        queryParamsHandling: 'merge',
      });
    });

    this.filter.query$.pipe(
      tap(() => this.loading = true),
      switchMap(f => this.personService.list(f)),
    ).subscribe();
  }
}
```

## License
MIT
