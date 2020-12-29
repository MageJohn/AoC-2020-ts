import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: ``,
    part1: undefined,
    part2: undefined,
    extra: {},
  },
];

function solution(input: string) {
  return { part1: part1(), part2: part2() };
}

function part1() {}

function part2() {}

let program = buildCommandline(solution, testCases);

program.parse(process.argv);
