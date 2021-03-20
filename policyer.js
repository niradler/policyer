#!/usr/bin/env node
const figlet = require("figlet");

figlet("policyer", function (err, data) {
  if (data) console.log(data);
  else if (err) {
    console.error(err.message);
  }
});
