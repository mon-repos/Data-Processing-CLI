//pathResolver.js  — resolve paths relative to current working directory
import path from "node:path";

export async function pathResolve(oldPath, change) {
  let newPath = path.resolve(oldPath, change);
  return newPath;
}
