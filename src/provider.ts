import * as _ from 'lodash';
import * as fs from 'fs';
import * as YAML from 'yaml';
import * as jmespath from 'jmespath';
import { logger } from './helpers';
import { utilities } from './utilities';
import { Report, Check, Step } from './types';

class Provider {
  public name: any;
  public utilities: any;
  public vars: any;
  public report: any;
  public evaluation: any;
  public value: any;

  constructor(name: string) {
    this.name = name;
    this.utilities = utilities;
    this.vars = {};
  }

  /**
   * @internal
   * Compiled string with variables and environment variables
   *
   * @remarks
   * Using lodash template
   *
   * @param str Parsed string with template parameters
   * @param vars Variables object
   * @return Compiled string with variables injected
   */
  static compile(str: string, vars = {}) {
    return _.template(str)({ ...process.env, ...vars });
  }

  /**
   * @internal
   * List files in a folder
   *
   * @param path Path to folder
   * @param filterRegex Regex match to filter files list
   * @return List of files
   */
  static listChecks(path: string, filterRegex?: string[]): string[] {
    let files: string[] = [];
    if (fs.statSync(path).isDirectory()) {
      files = fs.readdirSync(path);
    }
    if (Array.isArray(filterRegex) && Array.isArray(files)) {
      files = files.filter((fileName) => new RegExp(filterRegex[0], filterRegex[1]).test(fileName));
    }

    return files;
  }

  /**
   * @internal
   * Read check file
   *
   * @param path Path to check file [json/yml/yaml]
   * @return Check object
   */
  static readCheck(path: string) {
    let check;
    if (path.endsWith('.json')) {
      const file = fs.readFileSync(path, 'utf8');
      check = JSON.parse(file);
    } else if (path.endsWith('.yml') || path.endsWith('.yaml')) {
      const file = fs.readFileSync(path, 'utf8');
      check = YAML.parse(file);
    } else {
      throw new Error('check extension is not valid. (json/yml/yaml)');
    }

    return check;
  }

  static evaluateReports(reports: any, { failOn, failOnValue }: { failOn?: string; failOnValue?: string }) {
    failOn = failOn || 'any';

    for (let i = 0; i < reports.length; i++) {
      const { report } = reports[i];
      for (const key in report) {
        if (Object.hasOwnProperty.call(report, key)) {
          const check = report[key];
          if (check.hasError) {
            if (failOn == 'any') {
              return 1;
            }
            if (_.get<any, string>(check, failOn) == failOnValue) {
              return 1;
            }
          }
        }
      }
    }

    return 0;
  }

  /**
   * @internal
   * Set vars to expose them to the check {@link compile}
   *
   * @param path Path to check file [json/yml/yaml]
   * @return Check object
   */
  setVars(vars: any) {
    this.vars = vars;
  }

  evaluate() {
    throw new Error('Not implemented');
  }

  evaluateUtility(utility: any, value: any, utilityProps = []) {
    if (!utility) return value;
    const utilityFn = _.get(this.utilities, utility);
    if (!utilityFn) throw new Error('utility not found.');

    return utilityFn(value, ...utilityProps);
  }

  getPath(data: any, path: any, parser: any) {
    let value;
    switch (parser) {
      case 'jmespath':
        value = jmespath.search(data, path);
        break;
      case 'lodash':
        value = _.get(data, path, undefined);
        break;
      default:
        value = _.get(data, path, undefined);
        break;
    }

    return value;
  }

  evaluateValue(value: any, step: any) {
    const finalValue = this.evaluateUtility(step.utility, value, step.utilityProps);

    const evaluation = this.evaluateCondition(step.condition, finalValue, step.value);

    return evaluation;
  }

  evaluateStep(data: any, step: Step, check: Check) {
    const steps = step.and || step.or;
    if (steps) {
      /* @ts-ignore */
      const evaluations: any = steps.map((step: any) => this.evaluateStep(data, step, check));

      return evaluations;
    }
    let value;
    if (step.evaluationMethod) {
      let evaluations = [];

      switch (step.evaluationMethod) {
        case 'map':
          value = this.getPath(data, step.path, check.parser);
          if (!Array.isArray(value)) throw new Error('Evaluate value is not an array');
          evaluations = value.map((value: any) => this.evaluateValue(value, step));
          break;

        default:
          throw new Error('Unknown evaluationMethod');
      }
      const evaluationMethodFailPolicy = step.evaluationMethodFailPolicy || 'and';
      return {
        evaluation: evaluationMethodFailPolicy === 'and' ? !evaluations.includes(false) : evaluations.includes(true),
        value,
      };
    }

    value = this.getPath(data, step.path, check.parser);
    const evaluation = this.evaluateValue(value, step);
    return { evaluation, value };
  }

  evaluateCondition(condition: string, value: any, checkValue: any) {
    if (_.isString(checkValue)) checkValue = Provider.compile(checkValue, this.vars);

    switch (condition) {
      case 'equal':
        return value == checkValue;

      case 'not':
        return value != checkValue;

      case 'includes':
        if (Array.isArray(value)) return value.includes(checkValue);
        else if (typeof value == 'string') return value.includes(checkValue);
        return checkValue.includes(value);

      case 'gt':
        return value > checkValue;

      case 'gte':
        return value >= checkValue;

      case 'lt':
        return value < checkValue;

      case 'lte':
        return value < checkValue;

      default:
        throw new Error('Condition not found.');
    }
  }

  evaluateChecks(data: any, checks: Check[]) {
    const report: Report = {};
    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      const inspectedValues: any[] = [];
      const stepsResults: any[] = [];
      check.steps.forEach((step: Step) => {
        const evaluations = this.evaluateStep(data, step, check);
        if (Array.isArray(evaluations)) {
          const evaluationArr: any[] = [];
          const valuesArr: any[] = [];
          evaluations.forEach((evaluations) => {
            const { evaluation, value } = evaluations;
            evaluationArr.push(evaluation);
            valuesArr.push(value);
          });
          const finalEvaluation = step.and ? !evaluationArr.includes(false) : evaluationArr.includes(true);
          stepsResults.push(finalEvaluation);
          inspectedValues.push(valuesArr);
        } else {
          stepsResults.push(evaluations.evaluation);
          inspectedValues.push(evaluations.value);
        }
      });

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

export default Provider;
