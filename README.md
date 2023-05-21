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

### Filter
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
  @FilterProperty((submittedAtFrom: moment.Moment[]) => submittedAtFrom?.map(ts => ts.format('YYYY-MM')))
  submittedAtFrom?: moment.Moment[];
}
```


### Service
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


### Component
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

## API
API is in d.ts
