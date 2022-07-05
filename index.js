#!/usr/bin/env node
const pkgJson = require("./package.json");

if (pkgJson) {
  console.log("package.json exists already");
} else {
  console.log("creating package.json");
}
