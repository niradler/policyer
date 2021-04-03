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
  console.log(
    figlet.textSync("Policyer", {
      font: "Standard",
      whitespaceBreak: false,
    })
  );
  console.log(chalk.yellow("Visit us at policyer.org"));
};

module.exports = { logger, setVerbose, logo, figlet, chalk };
