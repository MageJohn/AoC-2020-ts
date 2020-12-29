import { buildCommandline, ExtraArgs } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `35
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

function solution(input: string, extra?: ExtraArgs) {
  let nums = input
    .trim()
    .split("\n")
    .map((n) => parseInt(n, 10));
  let preambleLen;
  if (!extra?.preambleLen) preambleLen = 25;
  else preambleLen = extra.preambleLen;
  let p1 = part1(nums, preambleLen);
  return { part1: p1, part2: part2(nums, p1) };
}

function part1(nums: number[], preambleLen: number) {
  for (let i = preambleLen; i < nums.length; i++) {
    if (!validate(nums.slice(i - preambleLen, i), nums[i])) {
      return nums[i];
    }
  }
  throw new Error("No solution found");
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

function part2(nums: number[], goal: number) {
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
}

let program = buildCommandline(solution, testCases);

program.parse(process.argv);
