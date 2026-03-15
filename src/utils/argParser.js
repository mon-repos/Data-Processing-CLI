//argParser.js     — parse command line arguments

// commands array of objects {key, arguments [{name, isMust, key, hasValue}]}
const commands = [
  {
    keyName: "up",
    arguments: [],
    functionPath: "./navigation.js",
    functionName: "up",
  },
  {
    keyName: "ls",
    arguments: [],
    functionPath: "./navigation.js",
    functionName: "ls",
  },
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
    functionPath: "./navigation.js",
    functionName: "cd",
  },
  {
    keyName: "csv-to-json",
    arguments: [
      {
        name: "sourceFilePath",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "targetFilePath",
        isMust: true,
        keyName: "--output",
        hasValue: true,
      },
    ],
    functionPath: "./commands/csvToJson.js",
    functionName: "csvToJson",
  },
  {
    keyName: "json-to-csv",
    arguments: [
      {
        name: "sourceFilePath",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "targetFilePath",
        isMust: true,
        keyName: "--output",
        hasValue: true,
      },
    ],
    functionPath: "./commands/jsonToCsv.js",
    functionName: "jsonToCsv",
  },
  {
    keyName: "count",
    arguments: [
      {
        name: "sourceFilePath",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
    ],
    functionPath: "./commands/count.js",
    functionName: "count",
  },
  {
    keyName: "hash",
    arguments: [
      {
        name: "sourceFilePath",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "hashAlgorithm",
        isMust: false,
        keyName: "--algorithm",
        hasValue: true,
      },
      {
        name: "saveFunction",
        isMust: false,
        keyName: "--save",
        hasValue: false,
      },
    ],
    functionPath: "./commands/hash.js",
    functionName: "hash",
  },
  {
    keyName: "hash-compare",
    arguments: [
      {
        name: "sourceFilePath",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "hashFilePath",
        isMust: true,
        keyName: "--hash",
        hasValue: true,
      },
      {
        name: "hashAlgorithm",
        isMust: false,
        keyName: "--algorithm",
        hasValue: true,
      },
    ],
    functionPath: "./commands/hashCompare.js",
    functionName: "hashCompare",
  },
  {
    keyName: "encrypt",
    arguments: [
      {
        name: "sourceFilePath",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "targetFilePath",
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
    functionPath: "./commands/encrypt.js",
    functionName: "encrypt",
  },
  {
    keyName: "decrypt",
    arguments: [
      {
        name: "sourceFilePath",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "targetFilePath",
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
    functionPath: "./commands/decrypt.js",
    functionName: "decrypt",
  },
  {
    keyName: "log-stats",
    arguments: [
      {
        name: "sourceFilePath",
        isMust: true,
        keyName: "--input",
        hasValue: true,
      },
      {
        name: "targetFilePath",
        isMust: true,
        keyName: "--output",
        hasValue: true,
      },
    ],
    functionPath: "./commands/logStats.js",
    functionName: "logStats",
  },
];

const commandKeyNames = commands.map((command) => command.keyName);

export function parseLine(line) {
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
      functionPath: commands[curCommandNum].functionPath,
      functionName: commands[curCommandNum].functionName,
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
    activeCommand = {
      name: "none",
    };
  }
  return activeCommand;
}
