import * as path from 'path';

class ChecksRunner {
  private checksPath: string;
  private Provider: any;

  constructor(Provider: any, checksPath: string) {
    this.Provider = Provider;
    this.checksPath = path.isAbsolute(checksPath) ? checksPath : path.join(process.cwd(), checksPath);
  }

  async run({
    onFail,
    onSuccess,
    filterRegex,
    failOn,
    failOnValue,
  }: {
    onSuccess?: (data: any) => void;
    onFail?: (error: Error, args?: any) => void;
    filterRegex?: string[];
    failOn?: string;
    failOnValue?: string;
  }) {
    try {
      const checksFiles = this.Provider.listChecks(this.checksPath, filterRegex);

      const checks = checksFiles.map((checkFile: string) =>
        this.Provider.readCheck(path.join(this.checksPath, checkFile)),
      );
      const reports = [];
      const summary = {
        passed: 0,
        failed: 0,
      };
      for (let i = 0; i < checks.length; i++) {
        const check = checks[i];
        const provider = new this.Provider();
        const report = await provider.evaluate(check).catch((error: any) => ({ error }));
        const totals = {
          passed: 0,
          failed: 0,
        };
        const checkIds = Object.keys(report);

        checkIds.forEach((key: string) => {
          const checkReport = report[key];
          if (checkReport.hasError) {
            totals.failed += 1;
          } else {
            totals.passed += 1;
          }
        });
        summary.passed += totals.passed;
        summary.failed += totals.failed;
        reports.push({ file: checksFiles[i], configuration: check.configuration, report, summary: totals });

        if (onSuccess) onSuccess({ report, configuration: check.configuration });
      }

      const exitCode = this.Provider.evaluateReports(reports, { failOn, failOnValue });
      return { summary, reports, exitCode };
    } catch (error) {
      if (onFail) onFail(error);
      else {
        console.error('ChecksRunner', error);
        throw new Error(error.message);
      }
    }
  }
}

export default ChecksRunner;
