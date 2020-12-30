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
  },
];

interface NeighbourCounter {
  (room: string[][], row: number, col: number): number;
}

function preprocess(input: string) {
  return input
    .trim()
    .split("\n")
    .map((row) => row.split(""));
}

function part1(room: string[][]) {
  return solve(room, countNeighboursSimple, 4);
}
function part2(room: string[][]) {
  return solve(room, countNeighboursLineOfSight, 5);
}

function solve(
  room: string[][],
  countNeighbours: NeighbourCounter,
  moveCount: number
) {
  let roomSize = room.length;
  function step() {
    let newRoom = new Array(roomSize);
    for (let row = 0; row < roomSize; row++) {
      let newRow = new Array(roomSize);
      newRoom[row] = newRow;
      for (let col = 0; col < roomSize; col++) {
        let chair = room[row][col];
        if (chair === ".") {
          newRow[col] = chair;
          continue;
        }
        let neighbours = countNeighbours(room, row, col);
        if (chair === "L" && neighbours === 0) {
          newRow[col] = "#";
        } else if (chair === "#" && neighbours >= moveCount) {
          newRow[col] = "L";
        } else {
          newRow[col] = chair;
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

let program = buildCommandline(testCases, preprocess, part1, part2);

program.parse(process.argv);
