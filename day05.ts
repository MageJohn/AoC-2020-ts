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

function createSolver(input: string) {
  let passes = input
    .trim()
    .split("\n")
    .map(passToId)
    .sort((a, b) => a - b);
  return {
    part1() {
      return passes[passes.length - 1];
    },

    part2() {
      let last = passes[0];
      for (let cur of passes.slice(1)) {
        if (last + 2 == cur) {
          return last + 1;
        }
        last = cur;
      }
      throw new Error("No solution found");
    },
  };
}

function passToId(pass: string) {
  return parseInt(pass.replaceAll(/F|L/g, "0").replaceAll(/B|R/g, "1"), 2);
}

let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
