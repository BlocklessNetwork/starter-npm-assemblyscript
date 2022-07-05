#!/usr/bin/env node
const fs = require("fs");
const { spawn } = require("child_process");

const basepkg = {
  name: "blockless-assembly-app",
  version: "1.0.0",
  main: "index.js",
  license: "APACHE-2.0",
  scripts: {
    clean: "rm -rf build",
    "build:release": "npm run clean; asc index.ts --target release",
    "build:debug": "npm run clean; asc index.ts --target debug",
  },
  dependencies: {
    "@blockless/sdk": "^1.0.0-preview",
    "as-wasi": "^0.4.6",
    assemblyscript: "^0.20.10",
    wasi: "^0.0.6",
  },
  private: true,
};

const baseASConfig = {
  targets: {
    debug: {
      outFile: "build/debug.wasm",
      textFile: "build/debug.wat",
      sourceMap: true,
      debug: true,
    },
    release: {
      outFile: "build/release.wasm",
      textFile: "build/release.wat",
      sourceMap: true,
      optimizeLevel: 3,
      shrinkLevel: 0,
      converge: false,
      noAssert: false,
    },
  },
  options: {
    bindings: "esm",
  },
};

const baseEntryFile = `import "wasi";

import { Console } from "as-wasi/assembly";
import { json, ipfs, http } from "@blockless/sdk";

Console.log('Hello, world!');
`;

const basePath = process.cwd();
const pkgPath = `${basePath}/package.json`;
try {
  const pkgJson = require(pkgPath);
  console.log("package.json exists already, try an empty directory");
} catch (err) {
  console.log(`creating package.json at ${pkgPath}`);
  fs.writeFileSync(pkgPath, JSON.stringify(basepkg, null, 2));

  fs.writeFileSync(
    `${basePath}/asconfig.json`,
    JSON.stringify(baseASConfig, null, 2)
  );

  fs.writeFileSync(`${basePath}/index.ts`, baseEntryFile);

  console.log(`installing dependencies`);
  const ls = spawn("npm", ["i"], { cwd: basePath });

  ls.stdout.on("data", (data) => {
    console.log(`${data}`);
  });

  ls.stderr.on("data", (data) => {
    console.log(`${data}`);
  });

  ls.on("error", (error) => {
    console.log(`error: ${error.message}`);
  });

  ls.on("close", (code) => {
    if (code != 0) console.log(`process exited with code ${code}`);
  });
}
