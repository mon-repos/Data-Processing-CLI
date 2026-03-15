//repl.js          — REPL handler, command parsing and dispatching

import readline from "node:readline";
import { parseLine } from "./utils/argParser.js";

export function repl(state) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.prompt();

  rl.on("line", async (line) => {
    const activeCommand = parseLine(line);
    if (activeCommand.name !== "none") {
      try {
        const commandModule = await import(activeCommand.functionPath);
        await commandModule[activeCommand.functionName](
          activeCommand.arguments,
          state,
        );
      } catch (error) {
        console.log("Operation failed (command operation)");
      }
    }
    rl.prompt();
  });

  rl.on("close", () => {
    console.log("\nThank you for using Data Processing CLI!");
    process.exit(0);
  });
}
