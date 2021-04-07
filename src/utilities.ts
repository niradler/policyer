import * as moment from 'moment';
import * as _ from 'lodash';

const date = {
  daysDiff: (dateStr: string) => moment().diff(moment(dateStr), 'days'),
  monthsDiff: (dateStr: string) => moment().diff(moment(dateStr), 'months'),
  format: (dateStr: string, formatStr = 'DD MM YYYY hh:mm:ss') => moment(dateStr).format(formatStr),
  isValid: (dateStr: string) => moment(dateStr).isValid(),
};

export const utilities = { ..._, date };
