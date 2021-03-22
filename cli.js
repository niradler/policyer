const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
class Cli {
  constructor(Provider, options = {}) {
    this.Provider = Provider;
    this.options = options;
    this.yargs = yargs;
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
        },
        async (argv) => {
          if (argv.verbose) console.log(argv);
          try {
            const currentPath = argv.internal ? __dirname : process.cwd();
            const checksFiles = this.Provider.listChecks(
              path.join(currentPath, argv.path)
            );
            const checks = checksFiles.map((checkFile) =>
              this.Provider.readCheck(
                path.join(currentPath, argv.path, checkFile)
              )
            );
            for (let i = 0; i < checks.length; i++) {
              const check = checks[i];
              const provider = new this.Provider();
              const report = await provider.evaluate(check);
              onSuccess(report);
            }
          } catch (error) {
            console.error("Error:", error.message);
            onFail(error);
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
