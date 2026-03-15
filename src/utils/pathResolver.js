//pathResolver.js  — resolve paths relative to current working directory
import path from "node:path";

export async function pathResolve(state, change) {
  console.log(state.currentDirectory);
  state.currentDirectory = path.resolve(state.currentDirectory, change);
  console.log(state.currentDirectory);
}
