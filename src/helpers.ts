import * as chalk from 'chalk';
import * as figlet from 'figlet';

let verbose: boolean = false;

export { chalk, figlet };

/**
 * @internal
 * Logger to consolidate logging
 *
 * @param args any parameters to log
 */
export const logger = (...args: any) => {
  if (verbose) console.log(...args);
};

/**
 * @internal
 * Set the log level to verbose
 *
 * @param isActive activate verbose logs
 */
export const setVerbose = (isActive: boolean) => {
  verbose = isActive;
};

/**
 * @internal
 * Print Policyer logo
 */
export const logo = () => {
  console.log(
    figlet.textSync('Policyer', {
      font: 'Standard',
      whitespaceBreak: false,
    }),
  );
  console.log(chalk.yellow('Visit us at policyer.org'));
};
