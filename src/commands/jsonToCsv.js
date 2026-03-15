//jsonToCsv.js   — json-to-csv command handler

import { pathResolve } from "../utils/pathResolver.js";
import * as fsp from "node:fs/promises";
import fs from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

export async function jsonToCsv(args, state) {
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
    console.log("Operation failed (source file not found)");
    return;
  }

  let fullJsonText = "";

  let readJsonTransform = new Transform({
    transform(chunk, encoding, callback) {
      fullJsonText += chunk.toString();
      callback();
    },

    flush(callback) {
      try {
        let parsedData = JSON.parse(fullJsonText);

        if (!Array.isArray(parsedData)) {
          callback(new Error("Input JSON is not an array"));
          return;
        }

        if (parsedData.length === 0) {
          callback(null, "");
          return;
        }

        let headers = Object.keys(parsedData[0]);
        let output = headers.join(",");

        for (let obj of parsedData) {
          let values = headers.map((header) => {
            return obj[header] ?? "";
          });
          output += "\n" + values.join(",");
        }

        callback(null, output);
      } catch (error) {
        callback(error);
      }
    },
  });

  try {
    await pipeline(
      fs.createReadStream(sourcePath),
      readJsonTransform,
      fs.createWriteStream(targetPath),
    );
  } catch (error) {
    console.log("Operation failed (stream operation)");
  }
  console.log(`You are currently in ${state.currentDirectory}`);
}
