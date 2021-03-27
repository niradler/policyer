const path = require("path");
const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { logger, setVerbose, logo } = require("./helpers");

class Cli {
  constructor(Provider, options = {}, output) {
    this.Provider = Provider;
    this.options = options;
    this.output = output || this.defaultOutput;
    this.yargs = yargs;
  }

  getCurrentPath(argv) {
    const currentPath = argv.internal ? __dirname : process.cwd();

    return currentPath;
  }

  defaultOutput(reports, argv) {
    const currentPath = this.getCurrentPath(argv);
    fs.writeFileSync(
      path.join(currentPath, argv.output),
      JSON.stringify(reports)
    );
  }

  run(onSuccess, onFail) {
    return this.yargs(hideBin(process.argv))
      .command(
        this.options.command || "*",
        this.options.description || "Scan checks",
        (yargs) => {
          yargs.positional("path", {
            alias: "p",
            describe: "path",
            default: "./checks",
          });
          yargs.positional("internal", {
            alias: "i",
            type: "boolean",
            describe: "use internal checks",
            default: true,
          });
          yargs.positional("output", {
            alias: "o",
            type: "string",
            describe: "file output",
          });
          yargs.positional("format", {
            alias: "f",
            type: "string",
            describe: "output format",
            default: "json",
            choices: ["json"],
          });
          yargs.positional("report", {
            alias: "r",
            type: "string",
            describe: "report type",
            default: "clean",
            choices: ["clean", "details"],
          });
        },
        async (argv) => {
          if (argv.verbose) setVerbose(argv.verbose);
          logo();
          logger(argv);
          try {
            const currentPath = this.getCurrentPath(argv);
            const checksFiles = this.Provider.listChecks(
              path.join(currentPath, argv.path)
            );
            const checks = checksFiles.map((checkFile) =>
              this.Provider.readCheck(
                path.join(currentPath, argv.path, checkFile)
              )
            );
            const reports = [];
            for (let i = 0; i < checks.length; i++) {
              const check = checks[i];
              const provider = new this.Provider();
              const report = await provider.evaluate(check);
              reports.push({ configuration: check.configuration, report });

              if (onSuccess)
                onSuccess({ report, argv, configuration: check.configuration });
            }
            if (argv.output) {
              this.output(reports, argv);
            }
            process.exit(0);
          } catch (error) {
            console.error("Error:", error.message);
            if (argv.verbose) console.error(error);
            if (onFail) onFail(error, argv);
            process.exit(1);
          }
        }
      )
      .option("verbose", {
        alias: "v",
        type: "boolean",
        description: "Run with verbose logging",
      })
      .help("help").argv;
  }
}

module.exports = Cli;
