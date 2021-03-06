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
      for (let i = 0; i < checks.length; i++) {
        const check = checks[i];
        const provider = new this.Provider();
        const report = await provider.evaluate(check).catch((error: any) => ({ error }));
        reports.push({ file: checksFiles[i], configuration: check.configuration, report });

        if (onSuccess) onSuccess({ report, configuration: check.configuration });
      }

      const exitCode = this.Provider.evaluateReports(reports, { failOn, failOnValue });
      return { reports, exitCode };
    } catch (error) {
      if (onFail) onFail(error);
      else {
        throw new Error(error.message);
      }
    }
  }
}

export default ChecksRunner;
