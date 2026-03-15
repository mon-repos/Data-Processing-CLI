//navigation.js    — navigation commands (up, cd, ls)

import { pathResolve } from "./utils/pathResolver.js";

export async function up(args, state) {
  pathResolve(state, "..");
}

export async function cd(args, state) {
  console.log("I am cd", args.pathname);
  pathResolve(state, args.pathname);
}
