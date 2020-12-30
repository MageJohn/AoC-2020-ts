import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `1721
979
366
299
675
1456`,
    part1: 514579,
    part2: 241861950,
  },
];

function preprocess(input: string) {
  return input
    .trim()
    .split("\n")
    .map((x: string) => parseInt(x, 10))
    .sort((a: number, b: number) => a - b);
}

function part1(report: number[]) {
  let solution = findPair(report, 2020);
  if (!solution) throw new Error("No solution found");
  return solution.a * solution.b;
}

function part2(report: number[]) {
  let total = 2020;
  for (let i = 0; i < report.length; i++) {
    let target = total - report[i];
    let target_parts = findPair(report.slice(i + 1), target);
    if (target_parts) {
      return report[i] * target_parts.a * target_parts.b;
    }
  }
  throw new Error("No solution found");
}

function findPair(report: number[], sumTo: number) {
  for (let i = 0; i < report.length; i++) {
    let j = report.length;
    let target = sumTo - report[i];
    while (report[--j] > target) {}
    if (report[j] == target) {
      return { a: report[i], b: report[j] };
    }
  }
}

let program = buildCommandline(testCases, preprocess, part1, part2);

program.parse(process.argv);
