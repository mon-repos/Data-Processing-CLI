//repl.js          — REPL handler, command parsing and dispatching

import readline from "node:readline";

// commands array of objects {key, arguments [{name, isMust, key, hasValue}]}
const commands = [
  { keyName: "up", arguments: [] },
  { keyName: "ls", arguments: [] },
  {
    keyName: "cd",
    arguments: [
      {
        name: "pathname",
        isMust: true,
        keyName: null,
        hasValue: true,
        position: 2,
      },
    ],
  },
  {
    keyName: "csv-to-json",
    arguments: [
      {
        name: "source_file_path",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "target_file_path",
        isMust: true,
        keyName: "--output",
        hasValue: true,
      },
    ],
  },
  {
    keyName: "json-to-csv",
    arguments: [
      {
        name: "source_file_path",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "target_file_path",
        isMust: true,
        keyName: "--output",
        hasValue: true,
      },
    ],
  },
  {
    keyName: "count",
    arguments: [
      {
        name: "source_file_path",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
    ],
  },
  {
    keyName: "hash",
    arguments: [
      {
        name: "source_file_path",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "hash_algorithm",
        isMust: false,
        keyName: "--algorithm",
        hasValue: true,
      },
      {
        name: "save_function",
        isMust: false,
        keyName: "--save",
        hasValue: false,
      },
    ],
  },
  {
    keyName: "hash-compare",
    arguments: [
      {
        name: "source_file_path",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "hash_file_path",
        isMust: true,
        keyName: "--hash",
        hasValue: true,
      },
      {
        name: "hash_algorithm",
        isMust: false,
        keyName: "--algorithm",
        hasValue: true,
      },
    ],
  },
  {
    keyName: "encrypt",
    arguments: [
      {
        name: "source_file_path",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "target_file_path",
        isMust: true,
        keyName: "--output",
        hasValue: true,
      },
      {
        name: "password",
        isMust: true,
        keyName: "--password",
        hasValue: true,
      },
    ],
  },
  {
    keyName: "decrypt",
    arguments: [
      {
        name: "source_file_path",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "target_file_path",
        isMust: true,
        keyName: "--output",
        hasValue: true,
      },
      {
        name: "password",
        isMust: true,
        keyName: "--password",
        hasValue: true,
      },
    ],
  },
  {
    keyName: "log-stats",
    arguments: [
      {
        name: "source_file_path",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "target_file_path",
        isMust: true,
        keyName: "--output",
        hasValue: true,
      },
    ],
  },
];

const commandKeyNames = commands.map((command) => command.keyName);

export function repl(state) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  rl.prompt();

  rl.on("line", (line) => {
    parseLine(line);
    rl.prompt();
  });

  rl.on("close", () => {
    console.log("\nThank you for using Data Processing CLI!");
    process.exit(0);
  });
}

function parseLine(line) {
  var activeCommand = null; // a command we will execute
  var receivedArguments = [];
  let isCommandValid = true; // a flag that command is valid
  let lineArguments = line.trim().split(" "); // an array of arguments received by our CLI
  let curCommandNum = commandKeyNames.indexOf(lineArguments[0]);

  // check the received command presents in the command list,
  if (curCommandNum >= 0) {
    //  make a command object
    activeCommand = {
      name: lineArguments[0],
      arguments: {},
    };

    // a list of argument required for the received command
    let receivedCommandReqArguments = commands[curCommandNum].arguments;

    // prepare an object for checking received arguments {argumentValue, isUsed}
    receivedArguments = lineArguments
      .slice(1)
      .map((argument) => ({ argumentValue: argument, isUsed: false }));
    //console.log("Received args at beginning ", receivedArguments);

    // for each argument key required for the command
    for (let argumentKey of receivedCommandReqArguments) {
      // if the argument has value w/o key
      if (!argumentKey.keyName) {
        // if there are arguments provided
        if (
          receivedArguments.length > 0 &&
          receivedArguments[0].isUsed == false
        ) {
          // prepare a key-value object and push to activeCommand
          activeCommand.arguments[argumentKey.name] =
            receivedArguments[0].argumentValue;
          receivedArguments[0].isUsed = true;
        } else {
          isCommandValid = false;
        }
      } else {
        // find it's index in received arguments by keyname
        let curArgIndexInLine = receivedArguments.indexOf(
          receivedArguments.find(
            (receivedArg) => receivedArg.argumentValue == argumentKey.keyName,
          ),
        );

        // if argument key presents in the received line & not used before
        if (
          curArgIndexInLine >= 0 &&
          receivedArguments[curArgIndexInLine].isUsed == false
        ) {
          //console.log("Index >=0 - Y");
          // if presents in line & must have a value
          if (argumentKey.hasValue) {
            //console.log("Needs a value - Y");
            // if the key required a value & was not the last in the line
            if (
              curArgIndexInLine < receivedArguments.length - 1 &&
              receivedArguments[curArgIndexInLine + 1].isUsed == false
            ) {
              //console.log("Not last index in line - Y");
              // prepare a key-value object and push to activeCommand

              activeCommand.arguments[argumentKey.name] =
                receivedArguments[curArgIndexInLine + 1].argumentValue;
              receivedArguments[curArgIndexInLine].isUsed = true;
              receivedArguments[curArgIndexInLine + 1].isUsed = true;
            } else {
              // it required a key & was last = invalid comand
              //console.log("It required a key but was last - Y");
              isCommandValid = false;
            }
          } else {
            // present in line & doesn't need a value
            // prepare a key-value object and push to activeCommand
            //console.log("Present in line, don't need value");

            activeCommand.arguments[argumentKey.name] = true;
            receivedArguments[curArgIndexInLine].isUsed = true;
          }
        } else if (argumentKey.isMust) {
          //console.log("Arg not found, but is must");
          // the key doesn't present in the received line & it is a must = invalid command
          isCommandValid = false;
        }
      }
    }

    //console.log("Required args ", receivedCommandReqArguments);
    //console.log("Received args ", receivedArguments);
    console.log("Active command ", activeCommand, " isValid ", isCommandValid);
  } else {
    //command is not from the list = invalid command
    isCommandValid = false;
  }
  if (!isCommandValid) {
    console.log("Invalid input");
  }
}

/*function parseLine(line) {
  let lineArguments = line.trim().split(" ");
  return lineArguments;
}

/*
  // 1. A callback function
  const checkLine = (usersAnswer) => {
    let trimmedAnswer = usersAnswer.trim(); // 1.1 trimming a line
    switch (
      trimmedAnswer // 1.2 make a switch for actions in case of various line values
    ) {
      case "uptime":
        console.log("Uptime: " + process.uptime().toFixed(2) + "s");
        rl.prompt();
        break;
      case "cwd":
        console.log(process.cwd());
        rl.prompt();
        break;
      case "date":
        let curDate = new Date().toISOString();
        console.log(curDate);
        rl.prompt();
        break;
      case "exit":
        rl.close();
        break;
      default:
        console.log("Unknown command");
        rl.prompt();
    }
  };

  // 2. Events
  rl.on("line", (input) => checkLine(input));
  rl.on("SIGINT", () => rl.close());
  rl.on("close", () => {
    console.log("Goodbye!");
    process.exit(0);
  });

  // 3. prompt
  //console.log("Commands: uptime, cwd, date, exit, ctrl+c");
  rl.prompt();
}
  */
