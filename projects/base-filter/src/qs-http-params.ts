import {HttpParams} from '@angular/common/http';
import {IStringifyOptions, stringify} from 'qs';

export class QsHttpParams extends HttpParams {

  constructor(
    private dto: Record<string, any> = {},
    private stringifyOptions: IStringifyOptions = {}
  ) {
    super();
  }

  // TODO добавить публичные методы по мере необходимости

  override toString(): string {
    return stringify(this.dto, {arrayFormat: 'brackets', ...this.stringifyOptions});
  }
}
