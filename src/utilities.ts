import * as moment from 'moment';
import * as _ from 'lodash';

const date = {
  daysDiff: (dateStr: string) => moment().diff(moment(dateStr), 'days'),
  monthsDiff: (dateStr: string) => moment().diff(moment(dateStr), 'months'),
  format: (dateStr: string, formatStr = 'DD MM YYYY hh:mm:ss') => moment(dateStr).format(formatStr),
  isValid: (dateStr: string) => moment(dateStr).isValid(),
};
/* eslint-disable */
function stringToRegex(regexStr: string) {
  const m = regexStr.match(/^([\/~@;%#'])(.*?)\1([gimsuy]*)$/);
  if (m) {
    return new RegExp(m[2], m[3].split('').filter((i, p, s) => s.indexOf(i) === p).join(''))
  }
  return new RegExp(regexStr);
}
/* eslint-enable */
function regexValidation(value: string, regexStr: string) {
  const regex = stringToRegex(regexStr);

  return regex.test(value);
}

export const utilities = { ..._, date, regex: regexValidation };
