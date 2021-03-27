let verbose = false;

const logger = (...args) => {
  if (verbose) console.log(...args);
};

const setVerbose = (isActive) => {
  verbose = isActive;
};

module.exports = { logger, setVerbose };
