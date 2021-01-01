import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `abc

a
b
c

ab
ac

a
a
a
a

b
`,
    part1: 11,
    part2: 6,
  },
];

function createSolver(input: string) {
  let groups = input.trim().split("\n\n");
  return {
    part1() {
      return sumSetSizes(
        groups.map((g) =>
          g
            .split("")
            .filter((c) => c != "\n")
            .reduce((set, q) => set.add(q), new Set())
        )
      );
    },

    part2() {
      return sumSetSizes(
        groups.map((g) =>
          g
            .split("\n")
            .map((m) => new Set(m))
            .reduce((s, m) => intersection(s, m))
        )
      );
    },
  };
}

function sumSetSizes<T>(sets: Set<T>[]): number {
  return sets.reduce((sum, set) => sum + set.size, 0);
}

function intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  let _intersection: Set<T> = new Set();
  for (let elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}

let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
