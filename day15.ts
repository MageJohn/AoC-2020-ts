import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Main example",
    input: `0,3,6`,
    part1: 436,
    part2: 175594,
  },
  {
    name: "More examples 1",
    input: `1,3,2`,
    part1: 1,
    part2: 2578,
  },
  {
    name: "More examples 2",
    input: `2,1,3`,
    part1: 10,
    part2: 3544142,
  },
  {
    name: "More examples 3",
    input: `1,2,3`,
    part1: 27,
    part2: 261214,
  },
  {
    name: "More examples 4",
    input: `2,3,1`,
    part1: 78,
    part2: 6895259,
  },
  {
    name: "More examples 5",
    input: `3,2,1`,
    part1: 438,
    part2: 18,
  },
  {
    name: "More examples 6",
    input: `3,1,2`,
    part1: 1836,
    part2: 362,
  },
];

function createSolver(input: string) {
  let startingNums = input
    .trim()
    .split(",")
    .map((n) => parseInt(n, 10));

  return {
    part1() {
      return playTil(startingNums, 2020);
    },
    part2() {
      return playTil(startingNums, 30000000);
    },
  };
}

function playTil(startingNums: number[], endTurn: number): number {
  let spoken: Map<number, number> = new Map();
  startingNums.forEach((num, i) => spoken.set(num, i + 1));
  let turn = startingNums.length + 1;
  let speakNext = spoken.has(startingNums[startingNums.length - 1])
    ? turn - 1 - (spoken.get(startingNums[startingNums.length - 1]) as number) //
    : 0;
  do {
    let speakNow = speakNext;
    speakNext = spoken.has(speakNow)
      ? turn - (spoken.get(speakNow) as number) //
      : 0;
    spoken.set(speakNow, turn);
  } while (++turn < endTurn);
  return speakNext;
}

let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
