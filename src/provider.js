const _ = require("lodash");
const fs = require("fs");
const YAML = require("yaml");
const jmespath = require("jmespath");
const { logger } = require("./helpers");
const utilities = require("./utilities");

class Provider {
  constructor(name) {
    this.name = name;
    this.utilities = utilities;
  }

  static compile(str, vars = {}) {
    return _.template(str)({ ...process.env, ...vars });
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

  static evaluateReports(reports, { failOn, failOnValue }) {
    for (let i = 0; i < reports.length; i++) {
      const { report } = reports[i];
      for (const key in report) {
        if (Object.hasOwnProperty.call(report, key)) {
          const check = report[key];
          if (check.hasError) {
            if (failOn == "any") {
              return 1;
            }
            if (_.get(check, failOn) == failOnValue) {
              return 1;
            }
          }
        }
      }
    }

    return 0;
  }

  evaluate() {
    throw new Error("Not implemented");
  }

  evaluateUtility(utility, value, utilityProps = []) {
    if (!utility) return value;
    const utilityFn = _.get(this.utilities, utility);
    if (!utilityFn) throw new Error("utility not found.");

    return utilityFn(value, ...utilityProps);
  }

  getPath(data, path, parser) {
    let value;
    switch (parser) {
      case "jmespath":
        value = jmespath.search(data, path);
        break;
      case "lodash":
        value = _.get(data, path, undefined);
        break;
      default:
        value = _.get(data, path, undefined);
        break;
    }

    return value;
  }

  evaluateValue(value, step) {
    logger({ value });
    const finalValue = this.evaluateUtility(
      step.utility,
      value,
      step.utilityProps
    );
    logger({ finalValue });
    const evaluation = this.evaluateCondition(
      step.condition,
      finalValue,
      step.value
    );
    logger({ evaluation });
    return evaluation;
  }

  evaluateStep(data, step, check) {
    const steps = step["and"] || step["or"];
    if (steps) {
      const evaluations = steps.map((step) =>
        this.evaluateStep(data, step, check)
      );

      return evaluations;
    }
    let value;
    if (step.evaluationMethod) {
      let evaluations = [];

      switch (step.evaluationMethod) {
        case "map":
          value = this.getPath(data, step.path, check.parser);
          evaluations = value.map((value) => this.evaluateValue(value, step));
          break;

        default:
          throw new Error("Unknown evaluationMethod");
      }
      const evaluationMethodFailPolicy =
        step.evaluationMethodFailPolicy || "and";
      return {
        evaluation:
          evaluationMethodFailPolicy === "and"
            ? !evaluations.includes(false)
            : evaluations.includes(true),
        value,
      };
    }

    value = this.getPath(data, step.path, check.parser);
    const evaluation = this.evaluateValue(value, step);
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
      const stepsResults = [];
      check.steps.forEach((step) => {
        const evaluations = this.evaluateStep(data, step, check);
        if (Array.isArray(evaluations)) {
          const evaluationArr = [];
          const valuesArr = [];
          evaluations.forEach((evaluations) => {
            const { evaluation, value } = evaluations;
            evaluationArr.push(evaluation);
            valuesArr.push(value);
          });
          const finalEvaluation = step["and"]
            ? !evaluationArr.includes(false)
            : evaluationArr.includes(true);
          stepsResults.push(finalEvaluation);
          inspectedValues.push(valuesArr);
        } else {
          stepsResults.push(evaluations.evaluation);
          inspectedValues.push(evaluations.value);
        }
      });

      logger(stepsResults, inspectedValues);
      report[check.id] = {
        hasError: stepsResults.includes(false),
        check,
        stepsResults,
        inspectedValues,
      };
    }

    logger(JSON.stringify(report, null, 2));

    return report;
  }
}

module.exports = Provider;
