import * as fs from 'fs';
import * as path from 'path';
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { logger, setVerbose, logo } = require('./helpers');

class Cli {
  public Provider: any;
  public options: any;
  public output: any;
  public yargs: any;

  constructor(Provider: any, options = {}, output: any) {
    this.Provider = Provider;
    this.options = options;
    this.output = output || this.defaultOutput;
    this.yargs = yargs;
  }

  getCurrentPath(argv: any) {
    const currentPath = argv.internal ? __dirname : process.cwd();

    return currentPath;
  }

  defaultOutput(reports: any, argv: any) {
    const currentPath = this.getCurrentPath(argv);
    fs.writeFileSync(path.join(currentPath, argv.output), JSON.stringify(reports));
  }

  run(onSuccess: any, onFail: any) {
    return this.yargs(hideBin(process.argv))
      .command(
        this.options.command || '*',
        this.options.description || 'Scan checks',
        (yargs: any) => {
          yargs.positional('path', {
            alias: 'p',
            describe: 'path',
            default: './checks',
          });
          yargs.positional('internal', {
            alias: 'i',
            type: 'boolean',
            describe: 'use internal checks',
            default: true,
          });
          yargs.positional('output', {
            alias: 'o',
            type: 'string',
            describe: 'file output',
          });
          yargs.positional('format', {
            alias: 'f',
            type: 'string',
            describe: 'output format',
            default: 'json',
            choices: ['json'],
          });
          yargs.positional('failOn', {
            type: 'string',
            describe: 'fail on',
            default: 'any',
          });
          yargs.positional('failOnValue', {
            type: 'string',
            describe: 'fail on value',
          });
          yargs.positional('filter', {
            type: 'string',
            describe: 'filter regex',
          });
          yargs.positional('filterFlags', {
            type: 'string',
            describe: 'filter flags',
          });
        },
        async (argv: any) => {
          if (argv.verbose) setVerbose(argv.verbose);
          logo();
          logger(argv);
          try {
            const currentPath = this.getCurrentPath(argv);
            let filter;
            if (argv.filter) {
              filter = [argv.filter, argv.filterFlags || ''];
            }
            const checksFiles = this.Provider.listChecks(path.join(currentPath, argv.path), filter);
            const checks = checksFiles.map((checkFile: any) =>
              this.Provider.readCheck(path.join(currentPath, argv.path, checkFile)),
            );
            const reports = [];
            for (let i = 0; i < checks.length; i++) {
              const check = checks[i];
              const provider = new this.Provider();
              const report = await provider.evaluate(check);
              reports.push({ configuration: check.configuration, report });

              if (onSuccess) onSuccess({ report, argv, configuration: check.configuration });
            }
            if (argv.output) {
              this.output(reports, argv);
            }
            const exitCode = this.Provider.evaluateReports(reports, argv);
            process.exit(exitCode);
          } catch (error) {
            console.error('Error:', error.message);
            if (argv.verbose) console.error(error);
            if (onFail) onFail(error, argv);
            process.exit(1);
          }
        },
      )
      .option('verbose', {
        alias: 'v',
        type: 'boolean',
        description: 'Run with verbose logging',
      })
      .help('help').argv;
  }
}

export default Cli;
