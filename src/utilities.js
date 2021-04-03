const _ = require("lodash");
const moment = require("moment");

const date = {
  daysDiff: (dateStr) => moment(dateStr).diff(moment(), "days"),
  monthsDiff: (dateStr) => moment(dateStr).diff(moment(), "months"),
  format: (dateStr, formatStr = "DD MM YYYY hh:mm:ss") =>
    moment(dateStr).format(formatStr),
  isValid: (dateStr) => moment(dateStr).isValid(),
};

module.exports = { ..._, date };
