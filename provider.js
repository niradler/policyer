const _ = require("lodash");

class Provider {
  constructor(name) {
    this.name = name;
    this.utilities = _;
  }

  evaluate() {
    throw new Error("Not implemented");
  }

  evaluateUtility(utility, value) {
    if (!utility) return value;
    if (!this.utilities[utility]) throw new Error("utility not found.");

    return this.utilities[utility](value);
  }

  evaluateCondition(condition, value, checkValue) {
    switch (condition) {
      case "equal":
        return value == checkValue;

      case "not":
        return value != checkValue;

      case "includes":
        return checkValue.includes(value);

      default:
        throw new Error("Condition not found.");
    }
  }

  evaluateChecks(data, checks) {
    const report = {};
    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      const inspectedValues = [];
      const stepsResults = check.steps.map((step) => {
        const value = _.get(data, step.path, undefined);
        inspectedValues.push(value);
        const finalValue = this.evaluateUtility(step.utility, value);
        const evaluation = this.evaluateCondition(
          step.condition,
          finalValue,
          step.value
        );

        return evaluation;
      });

      report[check.id] = {
        check,
        stepsResults,
        inspectedValues,
      };
    }

    return report;
  }
}

module.exports = Provider;
