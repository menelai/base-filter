# BaseFilter

```typescript
import {plainToClass} from 'class-transformer';

import {BaseFilter, FilterProperty, TransformBoolean} from '@kovalenko/base-filter';

export class UserListFilter extends BaseFilter {

  @FilterProperty()
  @TransformBoolean()
  isActive?: boolean;

  @FilterProperty()
  email?: string;

  @FilterProperty()
  roles?: string[];

  @FilterProperty()
  name?: string;

  constructor(limit: number, queryParams?: Observable<any>) {
    super(limit, queryParams);
  }

  forRequest(): this {
    return {...this};
  }

  override toJSON(): this {
    return {
      ...super.toJSON(),
    };
  }

  protected override transformParams(): void {
    super.transformParams();

    const params = {...this.queryParams} as Record<any, any>;
    params['limit'] = this.limit;

    const joj = plainToClass(UserListFilter, params, {enableImplicitConversion: true});

    Object.assign(this, joj);
  }
}
```
