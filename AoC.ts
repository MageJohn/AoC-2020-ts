import fs from "fs";
import { program } from "commander";
import chalk from "chalk";
import { stdin, stdout } from "process";
import { performance } from "perf_hooks";

export { buildCommandline };

type Result = string | number;

interface TestCase {
  name: string;
  input: string;
  part1?: Result;
  part2?: Result;
}

function buildCommandline<T>(
  testCases: TestCase[],
  preprocess?: (input: string) => T | null,
  part1?: (processedInput: T) => Result | null,
  part2?: (processedInput: T) => Result | null
) {
  const out = new Writer();
  return program
    .option(
      "-t, --test [testnumber...]",
      "run with test cases from problem statement"
    )
    .option("-p, --perf", "output performance metrics")
    .arguments("[input_file]")
    .description("solution for this day", { input_file: "input text file" })
    .action((inputFile) => {
      if (preprocess == null) {
        out.writeLine(
          `${chalk.red("Error:")} no input processing function. Can't continue`
        );
        return;
      }
      if (part1 == null) {
        out.writeLine(
          `${chalk.yellow("Warning:")} no part 1 solution function`
        );
      }
      if (part2 == null) {
        out.writeLine(
          `${chalk.yellow("Warning:")} no part 2 solution function`
        );
      }

      if (program.test) {
        out.writeLine(chalk.underline("Tests:"));

        testCases.forEach((testCase, i) => {
          if (Array.isArray(program.test) && !program.test.includes(`${i}`)) {
            return;
          }
          out.writeLine(`${testCase.name}:`);
          out.indent();

          out.write("Input processing: ");
          let processedInput: T | null = null;
          processedInput = preprocess(testCase.input);
          if (processedInput != null) {
            stdout.write(chalk.green("processed"));
          } else {
            stdout.write(chalk.red(`no output (${processedInput})`));
            return;
          }
          out.newline();

          out.write("Part 1: ");
          if (testCase.part1 == null) {
            out.write(chalk.yellow("no test case"));
          } else if (part1) {
            let start = performance.now();
            let result = part1(processedInput);
            let time = (performance.now() - start).toFixed(4);
            out.write(
              result === testCase.part1
                ? chalk.green(`${result}`)
                : chalk.red(`${result} != ${testCase.part1}`)
            );
            if (program.perf) out.write(` (time: ${time})`);
          } else {
            out.write(chalk.yellow("no function"));
          }
          out.newline();

          out.write("Part 2: ");
          if (testCase.part2 == null) {
            out.write(chalk.yellow("no test case"));
          } else if (part2) {
            let start = performance.now();
            let result = part2(processedInput);
            let time = (performance.now() - start).toFixed(4);
            out.write(
              result === testCase.part2
                ? chalk.green(`${result}`)
                : chalk.red(`${result} != ${testCase.part2}`)
            );
            if (program.perf) out.write(` (time: ${time})`);
          } else {
            out.write(chalk.yellow("no function"));
          }
          out.newline();
          out.deindent();
        });
        out.newline();
      }

      if (inputFile) {
        let fd;
        if (inputFile === "-") {
          fd = stdin.fd;
        } else {
          fd = fs.openSync(inputFile, "r");
        }
        let input = fs.readFileSync(fd, { encoding: "utf8" });
        fs.closeSync(fd);

        out.writeLine(chalk.underline("Solution: "));
        out.indent();

        out.write("Input processing: ");
        let processedInput = preprocess(input);
        if (processedInput) {
          out.write(chalk.green("success"));
        } else {
          out.write(chalk.red("no output") + ` (${processedInput})`);
          return;
        }
        out.newline();

        out.write("Part 1: ");
        if (part1) {
          let start = performance.now();
          let result = part1(processedInput);
          let time = (performance.now() - start).toFixed(4);
          if (result != null) {
            out.write(`${result}`);
          } else {
            out.write(chalk.yellow(`${result}`));
          }
          if (program.perf) out.write(` (time: ${time})`);
        } else {
          out.write(chalk.yellow("no function"));
        }
        out.newline();

        out.write("Part 2: ");
        if (part2) {
          let start = performance.now();
          let result = part2(processedInput);
          let time = (performance.now() - start).toFixed(4);
          if (result != null) {
            out.write(`${result}`);
          } else {
            out.write(chalk.yellow(`${result}`));
          }
          if (program.perf) out.write(` (time: ${time})`);
        } else {
          out.write(chalk.yellow("no function"));
        }
        out.newline();

        out.deindent();
      }
    });
}

export class Writer {
  private _indentLevel = 0;
  private _indentStep = 4;
  private indentation = "";
  private lineStart = true;

  write(value: string) {
    if (this.lineStart) {
      stdout.write(this.indentation);
    }
    stdout.write(value.replace(/\n(.)/g, "\n" + this.indentation + "$1"));
    this.lineStart = value[value.length - 1] === "\n";
  }

  writeLine(value: string) {
    this.write(value);
    this.newline();
  }

  newline() {
    stdout.write("\n");
    this.lineStart = true;
  }

  indent() {
    this.indentLevel++;
  }
  deindent() {
    this.indentLevel--;
  }

  get indentLevel(): number {
    return this._indentLevel;
  }
  set indentLevel(value: number) {
    this._indentLevel = value;
    this.reindent();
  }

  get indentStep(): number {
    return this._indentStep;
  }
  set indentStep(value: number) {
    this._indentStep = value;
    this.reindent();
  }

  private reindent() {
    this.indentation = Array(this._indentLevel * this._indentStep)
      .fill(" ")
      .join("");
  }
}
