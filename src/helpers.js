const figlet = require("figlet");
const chalk = require("chalk");
let verbose = false;

const logger = (...args) => {
  if (verbose) console.log(...args);
};

const setVerbose = (isActive) => {
  verbose = isActive;
};

const logo = () => {
  figlet("policyer", function (err, data) {
    if (data) console.log(data);
    else if (err) {
      console.error(err.message);
    }
  });
};

module.exports = { logger, setVerbose, logo, figlet, chalk };
