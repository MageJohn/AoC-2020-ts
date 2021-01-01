import { property } from "lodash";
import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Example 1",
    input: `939
7,13,x,x,59,x,31,19
`,
    part1: 295,
    part2: 1068781,
  },
  {
    name: "Example 2",
    input: `000
17,x,13,19
`,
    part2: 3417,
  },
  {
    name: "Example 3",
    input: `000
67,7,59,61
`,
    part2: 754018,
  },
  {
    name: "Example 4",
    input: `000
67,x,7,59,61
`,
    part2: 779210,
  },
  {
    name: "Example 5",
    input: `000
67,7,x,59,61
`,
    part2: 1261476,
  },
  {
    name: "Example 6",
    input: `000
1789,37,47,1889
`,
    part2: 1202161486,
  },
];

type ID = "x" | number;

function createSolver(input: string) {
  let [leaveAfterString, idsString] = input.split("\n") as [string, string];
  let leaveAfter = +leaveAfterString;
  let ids = idsString.split(",").map((id) => (+id ? +id : id)) as ID[];
  return {
    part1() {
      return part1(ids, leaveAfter);
    },
    part2() {
      return part2(ids);
    },
  };
}

function part1(ids: ID[], leaveAfter: number) {
  let earliest = Infinity;
  let earliestId = -1;
  for (let id of ids) {
    if (typeof id === "number") {
      let firstDeparture = Math.ceil(leaveAfter / id) * id;
      if (firstDeparture < earliest) {
        earliest = firstDeparture;
        earliestId = id;
      }
    }
  }
  if (earliest < Infinity) {
    return (earliest - leaveAfter) * earliestId;
  } else {
    throw new Error("No solution found");
  }
}

function part2(ids: ID[]) {
  let t = 0;
  let offset = 0;
  while (ids[offset] === "x" && offset < ids.length) offset++;
  let step = ids[offset] as number;

  while (offset < ids.length) {
    let id = ids[offset];
    if (id === "x") {
      offset++;
    } else if (Number.isInteger((t + offset) / id)) {
      offset++;
      step = lcm(step, id);
    } else {
      t += step;
    }
  }
  return t;
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

function gcd(a: number, b: number): number {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
