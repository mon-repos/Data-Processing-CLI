/*
src/
  main.js          — entry point, sets up REPL, handles navigation state
  repl.js          — REPL handler, command parsing and dispatching
  navigation.js    — navigation commands (up, cd, ls)
  commands/
    csvToJson.js   — csv-to-json command handler
    jsonToCsv.js   — json-to-csv command handler
    count.js       — count command handler
    hash.js        — hash command handler
    hashCompare.js — hash-compare command handler
    encrypt.js     — encrypt command handler
    decrypt.js     — decrypt command handler
    logStats.js    — log-stats command handler
  workers/
    logWorker.js   — worker thread for log-stats command
  utils/
    pathResolver.js  — resolve paths relative to current working directory
    argParser.js     — parse command line arguments
    */

import os from "node:os";
import { repl } from "./repl.js";

const state = {
  currentDirectory: os.homedir(),
};

console.log("Welcome to Data Processing CLI!");
console.log(`You are currently in ${state.currentDirectory}`);
repl(state);
