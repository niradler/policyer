# Getting Started

```sh
mkdir policyer-todo
cd policyer-todo
npm init -y
npm i policyer
touch index.js
touch cli.js
touch provider.js
mkdir checks
touch checks/todoCheck.yml # https://github.com/niradler/policyer-todo/blob/master/checks/todoCheck.yml
```

```js
//provider.js
const fetch = require("node-fetch");
const { Provider } = require("policyer");

class TodoProvider extends Provider {
  constructor(name = "todo-provider") {
    super(name);
  }

  async collect(configuration) {
    const todo = await fetch(
      `https://jsonplaceholder.typicode.com/todos/${configuration.payload.id}`
    );

    return todo.json();
  }

  async evaluate({ configuration, checks }) {
    if (configuration[configuration.type] == "todo") {
      const todo = await this.collect(configuration);
      const report = this.evaluateChecks(todo, checks);

      return report;
    } else {
      throw new Error("Not a valid todo check.");
    }
  }
}

module.exports = TodoProvider;

```

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

```js
//index.js
const provider = require("./provider");

module.exports = provider;
```

```sh
node cli.js
```