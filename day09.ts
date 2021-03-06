import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `preamble: 05
35
20
15
25
47
40
62
55
65
95
102
117
150
182
127
219
299
277
309
576
`,
    part1: 127,
    part2: 62,
    extra: { preambleLen: 5 },
  },
];

function createSolver(input: string) {
  let preambleLen: number;
  if (input.startsWith("preamble: ")) {
    preambleLen = +input.slice(10, 12);
    input = input.slice(13);
  } else {
    preambleLen = 25;
  }
  let nums = input
    .trim()
    .split("\n")
    .map((n) => parseInt(n, 10));
  let goal = 0;
  return {
    part1() {
      for (let i = preambleLen; i < nums.length; i++) {
        if (!validate(nums.slice(i - preambleLen, i), nums[i])) {
          goal = nums[i];
          return nums[i];
        }
      }
      throw new Error("No solution found");
    },
    part2() {
      for (let i = 0; i < nums.length - 1; i++) {
        for (let j = i + 1; j < nums.length; j++) {
          let range = nums.slice(i, j);
          let rangeTotal = range.reduce((a, b) => a + b);
          if (rangeTotal === goal) {
            return Math.min(...range) + Math.max(...range);
          } else if (rangeTotal > goal) {
            break;
          }
        }
      }
      throw new Error("Unexpected error");
    },
  };
}

function validate(preamble: number[], num: number) {
  for (let i = 0; i < preamble.length; i++) {
    let toFind = num - preamble[i];
    if (
      toFind > 0 &&
      preamble[i] !== toFind &&
      preamble.slice(i + 1).includes(toFind)
    ) {
      return true;
    }
  }
  return false;
}

let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
