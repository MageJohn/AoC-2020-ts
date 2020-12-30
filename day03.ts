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

function preprocess(input: string) {
  return input.trim().split("\n");
}

function part1(map: string[]) {
  return countTrees(map, { x: 3, y: 1 });
}

function part2(map: string[]) {
  let result = 1;
  for (let slope of [
    { x: 1, y: 1 },
    { x: 3, y: 1 },
    { x: 5, y: 1 },
    { x: 7, y: 1 },
    { x: 1, y: 2 },
  ]) {
    let res = countTrees(map, slope);
    result = result * res;
  }
  return result;
}

function countTrees(map: string[], slope: { x: number; y: number }) {
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

let program = buildCommandline(testCases, preprocess, part1, part2);

program.parse(process.argv);
