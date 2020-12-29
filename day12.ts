import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `F10
N3
F7
R90
F11
L95
`,
    part1: 25,
    part2: 286,
    extra: {},
  },
];

interface Instruction {
  action: string;
  value: number;
}

function solution(input: string) {
  let ixs: Instruction[] = input
    .trim()
    .split("\n")
    .map(
      (ix) =>
        ix.match(/^(?<action>[NSEWLRF])(?<value>\d+)$/)?.groups as {
          action: string;
          value: string;
        }
    )
    .map((ix) => ({ ...ix, value: +ix.value }));
  return { part1: part1(ixs), part2: part2(ixs) };
}

function part1(ixs: Instruction[]) {
  interface State {
    ns: number;
    ew: number;
    f: number;
  }
  let pos = ixs.reduce(
    function step(state: State, ix: Instruction): State {
      switch (ix.action) {
        case "N":
          return { ...state, ns: state.ns + ix.value };
        case "S":
          return { ...state, ns: state.ns - ix.value };
        case "E":
          return { ...state, ew: state.ew + ix.value };
        case "W":
          return { ...state, ew: state.ew - ix.value };
        case "L":
          return { ...state, f: mod(state.f + ix.value, 360) };
        case "R":
          return { ...state, f: mod(state.f - ix.value, 360) };
        case "F":
          switch (state.f) {
            case 0:
              return step(state, { action: "E", value: ix.value });
            case 90:
              return step(state, { action: "N", value: ix.value });
            case 180:
              return step(state, { action: "W", value: ix.value });
            case 270:
              return step(state, { action: "S", value: ix.value });
            default:
              throw new StepError(state, ix);
          }
        default:
          throw new StepError(state, ix);
      }
    },
    { ns: 0, ew: 0, f: 0 }
  );
  return Math.abs(pos.ew) + Math.abs(pos.ns);
}

function part2(ixs: Instruction[]) {
  interface State {
    ns: number;
    ew: number;
    wpns: number;
    wpew: number;
  }
  let pos = ixs.reduce(
    function step(state: State, ix: Instruction): State {
      switch (ix.action) {
        case "N":
          return { ...state, wpns: state.wpns + ix.value };
        case "S":
          return { ...state, wpns: state.wpns - ix.value };
        case "E":
          return { ...state, wpew: state.wpew + ix.value };
        case "W":
          return { ...state, wpew: state.wpew - ix.value };
        case "L":
          switch (ix.value) {
            case 90:
              return { ...state, wpns: state.wpew, wpew: -state.wpns };
            case 270:
              return step(state, { action: "R", value: 90 });
            case 180:
              return step(state, { action: "R", value: 180 });
            default:
              throw new StepError(state, ix);
          }
        case "R":
          switch (ix.value) {
            case 90:
              return { ...state, wpns: -state.wpew, wpew: state.wpns };
            case 270:
              return step(state, { action: "L", value: 90 });
            case 180:
              return { ...state, wpns: -state.wpns, wpew: -state.wpew };
            default:
              throw new StepError(state, ix);
          }
        case "F":
          return {
            ...state,
            ns: state.ns + state.wpns * ix.value,
            ew: state.ew + state.wpew * ix.value,
          };
        default:
          throw new StepError(state, ix);
      }
    },
    { ns: 0, ew: 0, wpns: 1, wpew: 10 }
  );
  return Math.abs(pos.ew) + Math.abs(pos.ns);
}

class StepError extends Error {
  constructor(state: any, ix: Instruction) {
    super();
    this.message = `Unexpected args: state=${JSON.stringify(
      state
    )} ix=${JSON.stringify(ix)}`;
    this.name = "StepError";
  }
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

let program = buildCommandline(solution, testCases);

program.parse(process.argv);
