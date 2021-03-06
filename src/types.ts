export interface Step {
  and?: string | Step[];
  or?: string | Step[];
  evaluationMethod?: string;
  path: string;
  utility?: string;
  utilityProps?: any[];
  condition: string;
  value: any;
  evaluationMethodFailPolicy?: string;
}

export interface Check {
  name: string;
  id: string;
  steps: Step[];
  parser: string;
  configuration: any;
  [key: string]: any;
}

export interface Report {
  [key: string]: {
    check: Check;
    hasError: boolean;
    stepsResults: any[];
    inspectedValues: any[];
  };
}
