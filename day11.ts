import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `L.LL.LL.LL
LLLLLLL.LL
L.L.L..L..
LLLL.LL.LL
L.LL.LL.LL
L.LLLLL.LL
..L.L.....
LLLLLLLLLL
L.LLLLLL.L
L.LLLLL.LL
`,
    part1: 37,
    part2: 26,
    extra: {},
  },
];

interface NeighbourCounter {
  (room: string[][], row: number, col: number): number;
}

function solution(input: string) {
  let room = input
    .trim()
    .split("\n")
    .map((row) => row.split(""));
  return {
    part1: solve(room, countNeighboursSimple, 4),
    part2: solve(room, countNeighboursLineOfSight, 5),
  };
}

function solve(
  room: string[][],
  countNeighbours: NeighbourCounter,
  moveCount: number
) {
  function step() {
    let newRoom = new Array(room.length);
    for (const row of room.keys()) {
      newRoom[row] = new Array(room[row].length);
      for (const col of room[row].keys()) {
        newRoom[row][col] = room[row][col];
        if (room[row][col] === ".") {
          continue;
        }
        let neighbours = countNeighbours(room, row, col);
        if (room[row][col] === "L" && neighbours === 0) {
          newRoom[row][col] = "#";
        } else if (room[row][col] === "#" && neighbours >= moveCount) {
          newRoom[row][col] = "L";
        }
      }
    }
    return newRoom;
  }

  let occupied = 0;
  let oldOccupied = NaN;
  while (occupied != oldOccupied) {
    oldOccupied = occupied;
    room = step();
    occupied = countOccupied(room);
  }
  return occupied;
}

function countNeighboursSimple(room: string[][], row: number, col: number) {
  return (
    +(room[row - 1]?.[col - 1] == "#") +
    +(room[row - 1]?.[col - 0] == "#") +
    +(room[row - 1]?.[col + 1] == "#") +
    +(room[row - 0]?.[col - 1] == "#") +
    +(room[row - 0]?.[col + 1] == "#") +
    +(room[row + 1]?.[col - 1] == "#") +
    +(room[row + 1]?.[col - 0] == "#") +
    +(room[row + 1]?.[col + 1] == "#")
  );
}

function countNeighboursLineOfSight(
  room: string[][],
  row: number,
  col: number
) {
  function f(di: number, dj: number) {
    let i = row,
      j = col;
    do {
      i += di;
      j += dj;
    } while (room[i]?.[j] === ".");
    return +(room[i]?.[j] === "#");
  }
  return (
    f(-1, -1) +
    f(-1, +0) +
    f(-1, +1) +
    f(+0, -1) +
    f(+0, +1) +
    f(+1, -1) +
    f(+1, +0) +
    f(+1, +1)
  );
}

function countOccupied(room: string[][]) {
  let count = 0;
  for (let row of room) {
    for (let seat of row) {
      count += +(seat === "#");
    }
  }
  return count;
}

let program = buildCommandline(solution, testCases);

program.parse(process.argv);
