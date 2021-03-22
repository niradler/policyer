# Cli

policyer has a build in cli.
the cli is build on yargs, yargs available on Cli.yargs

## Usage 

cli.run(onSuccess,onFailed)

```js
//cli.js
#!/usr/bin/env node
const { Cli } = require("policyer");
const Provider = require(".");

const cli = new Cli(Provider, { description: "Scan todo checks." });

const cliReport = (report) => {
  for (const key in report) {
    if (Object.hasOwnProperty.call(report, key)) {
      const check = report[key];
      check.status = check.stepsResults.includes(false) ? "Fail" : "success";
      check.severity = check.check.severity;
      check.check = check.check.name;
    }
  }
  console.table(report);
};

cli.run(cliReport);

module.exports = cli;

```

The cli has 3 available arguments:

- --path - path to the checks folder (relative)
- --internal - how do you want to reference the checks folder (defaults to true so checks folder need to be inside provider)
- --verbose - print args

```sh
node cli.js --path "./checks" -v
```

```sh
policyer-todo --path "./checks" --internal false
```