const Provider = require("../provider");
const { setVerbose } = require("../helpers");
setVerbose(false);

it("Provider - parse json.", () => {
  const check = Provider.readCheck("checks/todoCheck.json");
  expect(check.configuration.provider).toBe("todo-provider");
});

it("Provider - parse yml.", () => {
  const check = Provider.readCheck("checks/todoCheck.yml");
  expect(check.configuration.provider).toBe("todo-provider");
});

it("Provider - listChecks", () => {
  const checks = Provider.listChecks("checks");
  expect(checks[0]).toBe("jamespathCheck.json");
  expect(checks[1]).toBe("todoCheck.json");
  expect(checks[2]).toBe("todoCheck.yml");
});

it("Provider - evaluate", () => {
  const provider = new Provider();
  let message;
  try {
    provider.evaluate();
  } catch (error) {
    message = error.message;
  } finally {
    expect(message).toBe("Not implemented");
  }
});

it("Provider - evaluateUtility", () => {
  const provider = new Provider();
  const is = provider.evaluateUtility("isInteger", 1);
  expect(is).toBe(true);
});

it("Provider - evaluateCondition", () => {
  const provider = new Provider();
  const is = provider.evaluateCondition("equal", 1, 1);
  expect(is).toBe(true);
});

it("Provider - evaluateChecks", () => {
  const provider = new Provider();
  const data = {
    userId: 1,
    id: 1,
    title: "delectus aut autem",
    completed: false,
  };
  const check = Provider.readCheck("checks/todoCheck.json");
  const report = provider.evaluateChecks(data, check.checks);

  expect(report["todo-title-check"].check.severity).toBe("Warning");
  expect(report["todo-title-check"].stepsResults.includes(false)).toBe(false);
  expect(report["todo-title-check"].inspectedValues[0][0].length).toBe(18);

  expect(report["todo-completed-check"].check.severity).toBe("Warning");
  expect(report["todo-completed-check"].stepsResults.includes(false)).toBe(
    false
  );
  expect(report["todo-completed-check"].inspectedValues[0]).toBe(false);
});

it("Provider - evaluateChecks - jamespath", () => {
  const provider = new Provider();
  const data = {
    userId: 1,
    id: 1,
    accounts: [
      { name: "one", id: 1, email: "one@policyer.com" },
      { name: "two", id: 2, email: "two@policyer.com" },
    ],
    completed: false,
  };
  const check = Provider.readCheck("checks/jamespathCheck.json");
  const report = provider.evaluateChecks(data, check.checks);

  expect(report["todo-accounts-check"].hasError).toBe(false);
});

it("Provider - evaluateChecks - error", () => {
  const provider = new Provider();
  const data = {
    userId: 1,
    id: 1,
    title: "delectus aut autem",
    completed: false,
  };
  const check = Provider.readCheck("checks/todoCheckWithError.json");
  const report = provider.evaluateChecks(data, check.checks);

  expect(report["todo-title-check"].hasError).toBe(true);
  expect(report["todo-title-check"].check.severity).toBe("Warning");
  expect(report["todo-title-check"].stepsResults.includes(false)).toBe(true);

  expect(report["todo-completed-check"].check.severity).toBe("Warning");
  expect(report["todo-completed-check"].stepsResults.includes(false)).toBe(
    false
  );
  expect(report["todo-completed-check"].inspectedValues[0]).toBe(false);
});
