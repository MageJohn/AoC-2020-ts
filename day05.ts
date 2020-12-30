import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `FBFBBFFRLR
BFFFBBFRRR
FFFBBBFRRR
BBFFBBFRLL
`,
    part1: 820,
  },
  {
    name: "Sequential numbers",
    input: `FFFFFFFLLL
FFFFFFFLLR
FFFFFFFLRL
FFFFFFFRLL
FFFFFFFRLR
`,
    part1: 5,
    part2: 3,
  },
];

function preprocess(input: string) {
  return input
    .trim()
    .split("\n")
    .map(passToId)
    .sort((a, b) => a - b);
}

function part1(passes: number[]) {
  return passes[passes.length - 1];
}

function part2(passes: number[]) {
  let last = passes[0];
  for (let cur of passes.slice(1)) {
    if (last + 2 == cur) {
      return last + 1;
    }
    last = cur;
  }
  throw new Error("No solution found");
}

function passToId(pass: string) {
  return parseInt(pass.replaceAll(/F|L/g, "0").replaceAll(/B|R/g, "1"), 2);
}

let program = buildCommandline(testCases, preprocess, part1, part2);

program.parse(process.argv);
