import fs from "fs";
import { program } from "commander";
import chalk from "chalk";

export { buildCommandline };

type Result = string | number;

export type ExtraArgs = { [key: string]: any };

interface TestCase {
  name: string;
  input: string;
  part1?: Result;
  part2?: Result;
  extra?: ExtraArgs;
}

const stdout = process.stdout;

function buildCommandline(
  solution: (
    input: string,
    extra?: ExtraArgs
  ) => { part1?: Result; part2?: Result },
  testCases: TestCase[] = []
) {
  return program
    .option(
      "-t, --test [testnumber...]",
      "run with test cases from problem statement"
    )
    .arguments("[input_file]")
    .description("solution for this day", { input_file: "input text file" })
    .action((inputFile) => {
      if (program.test) {
        stdout.write(chalk.underline("Tests:\n"));

        testCases.forEach((testCase, i) => {
          if (program.test instanceof Array && !program.test.includes(`${i}`)) {
            return;
          }
          let result = solution(testCase.input, testCase.extra);
          stdout.write(`${testCase.name}:\n`);
          if (testCase.part1 != null) {
            stdout.write(
              `    Part 1: ${
                result.part1 === testCase.part1
                  ? chalk.green("Pass")
                  : chalk.red("Fail") +
                    ` (${result.part1} != ${testCase.part1})`
              }\n`
            );
          }
          if (testCase.part2 != null) {
            stdout.write(
              `    Part 2: ${
                result.part2 === testCase.part2
                  ? chalk.green("Pass")
                  : chalk.red("Fail") +
                    ` (${result.part2} != ${testCase.part2})`
              }\n`
            );
          }
        });
        stdout.write("\n");
      }

      if (inputFile) {
        let fd;
        if (inputFile === "-") {
          fd = process.stdin.fd;
        } else {
          fd = fs.openSync(inputFile, "r");
        }
        let input = fs.readFileSync(fd, { encoding: "utf8" });
        let result = solution(input);
        console.log(
          chalk.underline(`Solution\n`),
          `    Part 1: ${result.part1}\n`,
          `    Part 2: ${result.part2}\n`
        );
      }
    });
}
