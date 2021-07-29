import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `5764801
17807724
`,
    part1: 14897079,
    part2: undefined,
  },
];

const mod = 20201227;
const base = 7;

function createSolver(input: string) {
  let [card, door] = input.split("\n").map((n) => +n);
  return {
    part1() {
      let cardLoopSize = logMod(base, card, mod);
      return modPow(door, cardLoopSize, mod);
    },
    part2() {
      return "No part 2!";
    },
  };
}

function logMod(base: number, num: number, mod: number) {
  let value = 1;
  let exp = 0;
  while (value !== num) {
    value = (value * base) % mod;
    exp++;
  }
  return exp;
}

function modPow(base: number, exp: number, mod: number) {
  let value = 1;
  for (; exp > 0; exp--) {
    value = (value * base) % mod;
  }
  return value;
}

let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
