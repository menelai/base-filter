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

### Class `BaseFilter`

#### Protected static properties

<table>
  <tr>
  <td>
  key?

string
  </td>
  <td>
  If set then query params will pe parsed from the key in query string. E.g.:

  ```typescript
  class MyFilter extends BaseFilter {
    protected static readonly key = 't';
  }
  ```
  </td>
  </tr>

  <tr>
  <td>
  defaultPage = 1
  </td>
  <td>
  Default pagination page number
  </td>
  </tr>

 <tr>
  <td>
  limitOptions?

number[]
  </td>
  <td>
  Options for items per page, e.g. [10, 20, 30]
  </td>
  </tr>
</table>


#### Constructor

<table>
  <tr>
  <td>
  limit

number
  </td>
  <td>
  items per page
  </td>
  </tr>

  <tr>
  <td>
  queryParams?

Observable
  </td>
  <td>
  query Observable, e.g. Angular ActivatedRoute.queryParams. 
Optional, sets `query$` property. 
If omitted, the filter will be updated via internal observable `update$`
  </td>
  </tr>
</table>

#### Public properties

<table>
  <tr>
  <td>
  updated$

Observable
  </td>
  <td>
  readonly. Triggers when filter is being updated.
  </td>
  </tr>

  <tr>
  <td>
  query$

Observable
  </td>
  <td>
  readonly. Observes query params or internal changes.
  </td>
  </tr>

  <tr>
  <td>
  page

number
  </td>
  <td>
  Current pagination page. Updates from query string
  </td>
  </tr>
  <tr>
  <td>
  limit

number
  </td>
  <td>
  items per page
  </td>
  </tr>

  <tr>
  <td>
  offset

number
  </td>
  <td>
  getter for current pagination offset: `page * limit`
  </td>
  </tr>

</table>


#### Public methods

<table>
<tr>
<th colspan="2">clear</th>
</tr>
<tr>
<td colspan="2">Clears all filter properties and changes the page to first</td>
</tr>
<tr>
<th colspan="2">Parameters</th>
</tr>
<td colspan="2">No</td>
<tr>
<th colspan="2">Returns</th>
</tr>
<tr>
<td colspan="2">void</td>
</tr>
</table>


<table>
<tr>
<th colspan="2">changePage</th>
</tr>
<tr>
<td colspan="2">Changes filter page</td>
</tr>
<tr>
<th colspan="2">Parameters</th>
</tr>
<tr>
<td>pageIndex?<br>number</td><td>Index</td>
</tr>
<tr>
<th colspan="2">Returns</th>
</tr>
<tr>
<td colspan="2">void</td>
</tr>
</table>

<table>
<tr>
<th colspan="2">updated</th>
</tr>
<tr>
<td colspan="2">Triggers filter update</td>
</tr>
<tr>
<th colspan="2">Parameters</th>
</tr>
<td colspan="2">No</td>
<tr>
<th colspan="2">Returns</th>
</tr>
<tr>
<td colspan="2">void</td>
</tr>
</table>

<table>
<tr>
<th colspan="2">toJSON</th>
</tr>
<tr>
<td colspan="2">Returns a record of filter properties decorated with `@FilterProperty`</td>
</tr>
<tr>
<th colspan="2">Parameters</th>
</tr>
<td colspan="2">No</td>
<tr>
<th colspan="2">Returns</th>
</tr>
<tr>
<td colspan="2">Record&lt;string, any&gt;</td>
</tr>
</table>

<table>
<tr>
<th colspan="2">toQueryParams</th>
</tr>
<tr>
<td colspan="2">Returns a record of filter properties decorated with `@FilterProperty` for angular router, excluding limit</td>
</tr>
<tr>
<th colspan="2">Parameters</th>
</tr>
<td colspan="2">No</td>
<tr>
<th colspan="2">Returns</th>
</tr>
<tr>
<td colspan="2">Record&lt;string, any&gt;</td>
</tr>
</table>


#### Protected methods

<table>
<tr>
<th colspan="2">transformParams</th>
</tr>
<tr>
<td colspan="2">default query params transformation</td>
</tr>
<tr>
<th colspan="2">Parameters</th>
</tr>
<td colspan="2">No</td>
<tr>
<th colspan="2">Returns</th>
</tr>
<tr>
<td colspan="2">void</td>
</tr>
</table>

<table>
<tr>
<th colspan="2">deleteProperties</th>
</tr>
<tr>
<td colspan="2">default filter properties deletion</td>
</tr>
<tr>
<th colspan="2">Parameters</th>
</tr>
<td colspan="2">No</td>
<tr>
<th colspan="2">Returns</th>
</tr>
<tr>
<td colspan="2">void</td>
</tr>
</table>

### Decorators

<table>
  <tr>
  <td>
  @FilterProperty(serialize?: SerializeFn)<br>PropertyDecorator
  </td>
  <td>
  If set then query params will pe parsed from the key in query string. E.g.:

  ```typescript
  class MyFilter extends BaseFilter {
    protected static readonly key = 't';
  }
  ```
  </td>
  </tr>

  <tr>
  <td>
  @TransformBoolean()<br>PropertyDecorator
  </td>
  <td>
  Transforms query param into boolean

https://path/to?param=true becomes `{param: true}`
  </td>
  </tr>

  <tr>
  <td>
  @TransformArray()<br>PropertyDecorator
  </td>
  <td>
  Transforms query param into boolean

https://path/to?param=test becomes `{param: ['test']}`
  </td>
  </tr>  


  <tr>
  <td>
  @TransformMoment()<br>PropertyDecorator
  </td>
  <td>
Transforms date param into moment.js object.

https://path/to?date=2020-10-10 becomes `{param: Moment}`
  </td>
  </tr>  
</table>

### Class `QsHttpParams`
Class extending `@angular/common/http/HttpParams` to pass filter into angular http client.

```typescript
this.http.get('api/v1/test', {params: new QsHttpParams(filter.toJSON())});
```


### Example

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
