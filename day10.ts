import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Short example",
    input: `16
10
15
5
1
11
7
19
6
12
4
`,
    part1: 35,
    part2: 8,
  },
  {
    name: "Long example",
    input: `28
33
18
42
31
14
46
20
48
47
24
23
49
45
19
38
39
11
1
32
25
35
8
17
7
9
4
2
34
10
3
`,
    part1: 220,
    part2: 19208,
  },
];

function createSolver(input: string) {
  let adaptors = input
    .trim()
    .split("\n")
    .map((a) => parseInt(a, 10))
    .sort((a, b) => a - b);
  return {
    part1() {
      return part1(adaptors);
    },
    part2() {
      return part2(adaptors);
    },
  };
}

function part1(adaptors: number[]) {
  let { ones, threes } = adaptors.reduce(
    (acc, adaptor) => ({
      ones: acc.ones + +(adaptor - acc.last === 1),
      threes: acc.threes + +(adaptor - acc.last === 3),
      last: adaptor,
    }),
    { ones: 0, threes: 1, last: 0 }
  );
  return ones * threes;
}

function part2(adaptors: number[]) {
  let table = new Array(adaptors[adaptors.length - 1]);
  table[0] = 1;
  adaptors.forEach(
    (i) =>
      (table[i] =
        (table[i - 1] || 0) + (table[i - 2] || 0) + (table[i - 3] || 0))
  );
  return table[table.length - 1];
}

let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
