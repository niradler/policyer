const fetch = require("node-fetch");
const { Provider } = require("../../index");

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
