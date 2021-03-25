const _ = require("lodash");
const fs = require("fs");
const YAML = require("yaml");

class Provider {
  constructor(name) {
    this.name = name;
    this.utilities = _;
  }

  static listChecks(path) {
    if (fs.statSync(path).isDirectory()) return fs.readdirSync(path);

    return [];
  }

  static readCheck(path) {
    let check;
    if (path.endsWith(".json")) {
      const file = fs.readFileSync(path, "utf8");
      check = JSON.parse(file);
    } else if (path.endsWith(".yml") || path.endsWith(".yaml")) {
      const file = fs.readFileSync(path, "utf8");
      check = YAML.parse(file);
    } else {
      throw new Error("check extension is not valid. (json/yml/yaml)");
    }

    return check;
  }

  evaluate() {
    throw new Error("Not implemented");
  }

  evaluateUtility(utility, value, utilityProps = []) {
    if (!utility) return value;
    if (!this.utilities[utility]) throw new Error("utility not found.");

    return this.utilities[utility](value, ...utilityProps);
  }

  evaluateStep(data, step) {
    const value = _.get(data, step.path, undefined);

    const finalValue = this.evaluateUtility(
      step.utility,
      value,
      step.utilityProps
    );
    const evaluation = this.evaluateCondition(
      step.condition,
      finalValue,
      step.value
    );

    return { evaluation, value };
  }

  evaluateCondition(condition, value, checkValue) {
    switch (condition) {
      case "equal":
        return value == checkValue;

      case "not":
        return value != checkValue;

      case "includes":
        if (Array.isArray(value)) return value.includes(checkValue);
        return checkValue.includes(value);

      case "gt":
        return value > checkValue;

      case "gte":
        return value >= checkValue;

      case "lt":
        return value < checkValue;

      case "lte":
        return value < checkValue;

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
        const steps = step["and"] || step["or"];
        if (steps) {
          const stepsInspectedValues = [];
          const evaluationValues = steps.map((step) => {
            const { evaluation, value } = this.evaluateStep(data, step);
            stepsInspectedValues.push(value);
            return evaluation;
          });
          inspectedValues.push(stepsInspectedValues);

          return step["and"]
            ? !evaluationValues.includes(false)
            : evaluationValues.includes(true);
        }

        const { evaluation, value } = this.evaluateStep(data, step);
        inspectedValues.push(value);

        return evaluation;
      });

      report[check.id] = {
        hasError: stepsResults.includes(false),
        check,
        stepsResults,
        inspectedValues,
      };
    }

    return report;
  }
}

module.exports = Provider;
