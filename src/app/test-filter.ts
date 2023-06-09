import { BaseFilter, FilterProperty, TransformBoolean, TransformArray, TransformMoment} from "base-filter";
import {Type} from 'class-transformer';
import moment from "moment";


export class TestFilter extends BaseFilter {
  static override readonly limitOptions = [10, 20];

  static override readonly key = 'joj';
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
