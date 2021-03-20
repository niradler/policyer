const fs = require("fs");
const YAML = require("yaml");
const TodoProvider = require("../examples/providers/TodoProvider");

it("TodoProvider - evaluate example checks json.", async () => {
  try {
    const checks = [require("../examples/checks/todoCheck.json")];
    const provider = new TodoProvider();
    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      const report = await provider.evaluate(check);
      const reportKeys = Object.keys(report);
      for (let i = 0; i < reportKeys.length; i++) {
        const checkId = reportKeys[i];
        expect(report[checkId].stepsResults.includes(false)).toBe(false);
      }
    }
  } catch (error) {
    expect(error).toBe(undefined);
  }
});

it("TodoProvider - evaluate example checks yml.", async () => {
  try {
    const file = fs.readFileSync("examples/checks/todoCheck.yml", "utf8");
    const checks = [YAML.parse(file)];
    const provider = new TodoProvider();
    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      const report = await provider.evaluate(check);
      const reportKeys = Object.keys(report);
      for (let i = 0; i < reportKeys.length; i++) {
        const checkId = reportKeys[i];
        expect(report[checkId].stepsResults.includes(false)).toBe(false);
      }
    }
  } catch (error) {
    expect(error).toBe(undefined);
  }
});
