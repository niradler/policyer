#!/usr/bin/env node
const { Cli } = require("../../index");
const Provider = require(".");

const cli = new Cli(Provider, { description: "Scan todo checks." });

const cliReport = (report) => {
  for (const key in report) {
    if (Object.hasOwnProperty.call(report, key)) {
      const check = report[key];
      check.status = check.stepsResults.includes(false) ? "Fail" : "success";
      check.severity = check.check.severity;
      check.check = check.check.name;
    }
  }
  console.table(report);
};

cli.run(cliReport);

module.exports = cli;
