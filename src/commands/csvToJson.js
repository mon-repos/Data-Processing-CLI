//csvToJson.js   — csv-to-json command handler

import { pathResolve } from "../utils/pathResolver.js";
import * as fsp from "node:fs/promises";
import fs from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

export async function csvToJson(args, state) {
  //console.log(args.sourceFilePath);
  //console.log(args.targetFilePath);

  let sourcePath = await pathResolve(
    state.currentDirectory,
    args.sourceFilePath,
  );
  let targetPath = await pathResolve(
    state.currentDirectory,
    args.targetFilePath,
  );

  try {
    await fsp.stat(sourcePath);
  } catch (error) {
    console.log("Operation failed (source file not found");
    return;
  }

  let buffer = "";
  let headers = null;
  let isFirstObject = true;

  function lineToObject(line) {
    let values = line.split(",");
    let result = {};
    for (let i = 0; i < headers.length; i += 1) {
      result[headers[i]] = values[i] ?? "";
    }
    return result;
  }

  let csvToJsonTransform = new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      let lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      let output = "";
      for (let line of lines) {
        if (line === "") continue;
        if (headers === null) {
          headers = line.split(",");
          continue;
        }
        let obj = lineToObject(line);
        let json = JSON.stringify(obj, null, 2);
        if (isFirstObject) {
          output += "[\n" + json;
          isFirstObject = false;
        } else {
          output += ",\n" + json;
        }
      }
      callback(null, output);
    },

    flush(callback) {
      let output = "";
      if (buffer !== "") {
        if (headers === null) {
          headers = buffer.split(",");
        } else {
          let obj = lineToObject(buffer);
          let json = JSON.stringify(obj, null, 2);
          if (isFirstObject) {
            output += "[\n" + json;
            isFirstObject = false;
          } else {
            output += ",\n" + json;
          }
        }
      }
      if (isFirstObject) {
        output += "[]";
      } else {
        output += "\n]";
      }
      callback(null, output);
    },
  });

  try {
    await pipeline(
      fs.createReadStream(sourcePath),
      csvToJsonTransform,
      fs.createWriteStream(targetPath),
    );
  } catch (error) {
    console.log("Operation failed (stream operation)");
  }
}
