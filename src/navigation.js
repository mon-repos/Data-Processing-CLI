//navigation.js    — navigation commands (up, cd, ls)

import { pathResolve } from "./utils/pathResolver.js";
import * as fs from "node:fs/promises";

export async function up(args, state) {
  state.currentDirectory = await pathResolve(state.currentDirectory, "..");
  console.log(state.currentDirectory);
}

export async function cd(args, state) {
  let newPath = await pathResolve(state.currentDirectory, args.pathname);

  try {
    await fs.stat(newPath);
    state.currentDirectory = newPath;
    console.log(state.currentDirectory);
  } catch (error) {
    console.log("Operation failed");
  }
}

export async function ls(args, state) {
  let fileList = [];
  let maxLength = 0;
  let dirList = [];
  let entries = await fs.readdir(state.currentDirectory, {
    withFileTypes: true,
  });
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].name.length > maxLength) {
      maxLength = entries[i].name.length;
    }
    if (entries[i].isFile()) {
      fileList.push(entries[i].name);
    } else {
      dirList.push(entries[i].name);
    }
  }
  let fileListSorted = fileList.sort((a, b) => a.localeCompare(b));
  let dirListSorted = dirList.sort((a, b) => a.localeCompare(b));

  for (let dir of dirListSorted) {
    let line = dir + " ".repeat(maxLength - dir.length + 2) + "[folder]";
    console.log(line);
  }
  for (let file of fileListSorted) {
    let line = file + " ".repeat(maxLength - file.length + 2) + "[file]";
    console.log(line);
  }
  console.log(state.currentDirectory);
}
