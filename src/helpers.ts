import * as chalk from 'chalk';
import * as figlet from 'figlet';

let verbose: boolean = false;

export { chalk, figlet };

export const logger = (...args: any) => {
  if (verbose) console.log(...args);
};

export const setVerbose = (isActive: boolean) => {
  verbose = isActive;
};

export const logo = () => {
  console.log(
    figlet.textSync('Policyer', {
      font: 'Standard',
      whitespaceBreak: false,
    }),
  );
  console.log(chalk.yellow('Visit us at policyer.org'));
};
