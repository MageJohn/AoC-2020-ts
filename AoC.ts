import fs from "fs";
import { Command } from "commander";
import chalk from "chalk";
import { stdin, stdout } from "process";
import { performance } from "perf_hooks";
import { inspect } from "util";
import { log } from "console";

export { buildCommandline };

type Result = string | number;

interface TestCase {
  name: string;
  input: string;
  part1?: Result;
  part2?: Result;
}

interface Solver {
  (input: string): SolverInstance;
}
interface SolverInstance {
  part1: () => Result;
  part2: () => Result;
}

function buildCommandline(testCases: TestCase[], createSolver: Solver) {
  return new Command()
    .option(
      "-t, --test [testnumber...]",
      "run with test cases from problem statement"
    )
    .option("-p, --perf", "output performance metrics")
    .arguments("[input_file]")
    .description("solution for this day", { input_file: "input text file" })
    .action((inputFile: string, args: Command) => {
      if (args.test) {
        log(chalk.underline("Tests:"));

        if (Array.isArray(args.test)) {
          testCases = testCases.filter((_v, i) => args.test.includes(i));
        }

        testCases.forEach((testCase) => {
          log(`${testCase.name}:`);
          let { res: solver, perf } = perfWrapper(createSolver)(testCase.input);
          if (args.perf) {
            log(`    Startup time: ${perf.toFixed(4)}`);
          }
          runPartTest(
            1,
            perfWrapper(solver.part1.bind(solver)),
            testCase.part1,
            args.perf
          );
          runPartTest(
            2,
            perfWrapper(solver.part2.bind(solver)),
            testCase.part2,
            args.perf
          );
        });
        stdout.write("\n");
      }

      if (inputFile) {
        let fd = inputFile === "-" ? stdin.fd : fs.openSync(inputFile, "r");
        let input = fs.readFileSync(fd, { encoding: "utf8" });
        fs.closeSync(fd);

        log(chalk.underline("Solution: "));

        let { res: solver, perf } = perfWrapper(createSolver)(input);
        if (args.perf) {
          log(`    Startup time: ${perf.toFixed(4)}`);
        }

        runPart(1, perfWrapper(solver.part1.bind(solver)), args.perf);
        runPart(2, perfWrapper(solver.part2.bind(solver)), args.perf);
      }
    });
}

function runPart(
  part: number,
  func: () => { perf: number; res: Result },
  showPerf: boolean
): void {
  stdout.write(`    Part ${part}: `);
  let result = func();
  let outColor = result.res == null ? chalk.red : chalk.green;
  stdout.write(outColor(`${inspect(result.res)}`));
  if (showPerf) {
    stdout.write(` (${result.perf.toFixed(4)})`);
  }
  stdout.write("\n");
}

function runPartTest(
  part: number,
  func: () => { perf: number; res: Result },
  expected: Result | undefined,
  showPerf: boolean
): void {
  stdout.write(`    Part ${part}: `);
  if (expected == null) {
    stdout.write(chalk.yellow("no test case"));
  } else {
    let result = func();
    if (result.res === expected) {
      stdout.write(chalk.green(`${inspect(result.res)}`));
    } else {
      stdout.write(
        chalk.red(`${inspect(result.res)} !== ${inspect(expected)}`)
      );
    }
    if (showPerf) {
      stdout.write(` (${result.perf.toFixed(4)})`);
    }
  }
  stdout.write("\n");
}

function perfWrapper<T extends any[], U>(fn: (...args: T) => U) {
  return (...args: T): { perf: number; res: U } => {
    let start = performance.now();
    let res = fn(...args);
    return { perf: performance.now() - start, res };
  };
}
