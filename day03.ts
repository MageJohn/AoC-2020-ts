import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `..##.......
#...#...#..
.#....#..#.
..#.#...#.#
.#...##..#.
..#.##.....
.#.#.#....#
.#........#
#.##...#...
#...##....#
.#..#...#.#
`,
    part1: 7,
    part2: 336,
  },
];

function solution(input: string) {
  let map = input.trim().split("\n");
  let s1 = part1(map, { x: 3, y: 1 });

  let s2 = 1;
  for (let slope of [
    { x: 1, y: 1 },
    { x: 3, y: 1 },
    { x: 5, y: 1 },
    { x: 7, y: 1 },
    { x: 1, y: 2 },
  ]) {
    let res = part1(map, slope);
    s2 = s2 * res;
  }
  return { part1: s1, part2: s2 };
}

function part1(map: string[], slope: { x: number; y: number }) {
  let width = map[0].length,
    height = map.length;
  let treeCount = 0;

  for (let x = 0, y = 0; y < height; x += slope.x, y += slope.y) {
    x = x % width;

    if (map[y][x] == "#") {
      treeCount++;
    }
  }

  return treeCount;
}

let program = buildCommandline(solution, testCases);

program.parse(process.argv);
