import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: ``,
    part1: undefined,
    part2: undefined,
  },
];

function createSolver(input: string) {
  return {
    part1() {},
    part2() {},
  };
}

let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
