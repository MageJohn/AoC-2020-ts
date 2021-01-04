import fs from "fs";
import { Command } from "commander";
import chalk from "chalk";
import { stdout } from "process";
import { performance } from "perf_hooks";
import { inspect } from "util";
import { log } from "console";

export { buildCommandline };

type Result = string | number;
type PartFunc = () => Promise<Result> | Result;

interface TestCase {
  name: string;
  input: string;
  part1?: Result;
  part2?: Result;
}

interface Solver {
  (input: string, args?: Command): SolverInstance;
}
interface SolverInstance {
  part1: PartFunc;
  part2: PartFunc;
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
    .action(async (inputFile: string, args: Command) => {
      if (args.test) {
        log(chalk.underline("Tests:"));

        if (Array.isArray(args.test)) {
          testCases = testCases.filter((_v, i) => args.test.includes(i));
        }

        for (let testCase of testCases) {
          log(`${testCase.name}:`);
          let { res: solver, perf } = perfWrapper(createSolver)(
            testCase.input,
            args
          );
          if (args.perf) {
            log(`    Startup time: ${perf.toFixed(4)}`);
          }
          await runPartTest(
            1,
            perfWrapper(solver.part1.bind(solver)),
            testCase.part1,
            args.perf
          );
          await runPartTest(
            2,
            perfWrapper(solver.part2.bind(solver)),
            testCase.part2,
            args.perf
          );
        }
        stdout.write("\n");
      }

      if (inputFile) {
        let path = inputFile === "-" ? "/dev/stdin" : inputFile;
        let input = await fs.promises.readFile(path, { encoding: "utf8" });

        log(chalk.underline("Solution: "));

        let { res: solver, perf } = perfWrapper(createSolver)(input, args);
        if (args.perf) {
          log(`    Startup time: ${perf.toFixed(4)}`);
        }

        await runPart(1, perfWrapper(solver.part1.bind(solver)), args.perf);
        await runPart(2, perfWrapper(solver.part2.bind(solver)), args.perf);
      }
    });
}

async function runPart(
  part: number,
  func: () => { perf: number; res: Result | Promise<Result> },
  showPerf: boolean
): Promise<void> {
  stdout.write(`    Part ${part}: `);
  let result = func();
  let resultVal = await result.res;
  let outColor = resultVal == null ? chalk.red : chalk.green;
  stdout.write(outColor(`${inspect(resultVal)}`));
  if (showPerf) {
    stdout.write(` (${result.perf.toFixed(4)})`);
  }
  stdout.write("\n");
}

async function runPartTest(
  part: number,
  func: () => { perf: number; res: Result | Promise<Result> },
  expected: Result | undefined,
  showPerf: boolean
): Promise<void> {
  stdout.write(`    Part ${part}: `);
  if (expected == null) {
    stdout.write(chalk.yellow("no test case"));
  } else {
    let result = func();
    let resultVal = await result.res;
    if (resultVal === expected) {
      stdout.write(chalk.green(`${inspect(resultVal)}`));
    } else {
      stdout.write(chalk.red(`${inspect(resultVal)} !== ${inspect(expected)}`));
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
