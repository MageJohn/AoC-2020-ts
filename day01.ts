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

function solution(input: string) {
  let report = input
    .trim()
    .split("\n")
    .map((x: string) => parseInt(x, 10))
    .sort((a: number, b: number) => a - b);

  let solution1 = part1(report, 2020);

  return {
    part1: solution1.a * solution1.b,
    part2: part2(report, 2020),
  };
}

function part1(report: number[], total: number) {
  let solution = findPair(report, total);
  if (!solution) throw new Error("No solution found");
  return solution;
}

function part2(report: number[], total: number) {
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

let program = buildCommandline(solution, testCases);

program.parse(process.argv);
