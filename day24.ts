import chalk from "chalk";
import { stdout } from "process";
import { buildCommandline } from "./AoC";
import timersPromises from "timers/promises";
import { Command } from "commander";

const { max, min, abs, trunc } = Math;

const testCases = [
  {
    name: "Page example",
    input: `sesenwnenenewseeswwswswwnenewsewsw
neeenesenwnwwswnenewnwwsewnenwseswesw
seswneswswsenwwnwse
nwnwneseeswswnenewneswwnewseswneseene
swweswneswnenwsewnwneneseenw
eesenwseswswnenwswnwnwsewwnwsene
sewnenenenesenwsewnenwwwse
wenwwweseeeweswwwnwwe
wsweesenenewnwwnwsenewsenwwsesesenwne
neeswseenwwswnwswswnw
nenwswwsewswnenenewsenwsenwnesesenew
enewnwewneswsewnwswenweswnenwsenwsw
sweneswneswneneenwnewenewwneswswnese
swwesenesewenwneswnwwneseswwne
enesenwswwswneneswsenwnewswseenwsese
wnwnesenesenenwwnenwsewesewsesesew
nenewswnwewswnenesenwnesewesw
eneswnwswnwsenenwnwnwwseeswneewsenese
neswnwewnwnwseenwseesewsenwsweewe
wseweeenwnesenwwwswnew
`,
    part1: 10,
    part2: 2208,
  },
];

type Dir = "e" | "se" | "sw" | "w" | "nw" | "ne";
type Step =
  | {
      type: "flip";
      flips: Axial[];
    }
  | {
      type: "highlight";
      pos: Axial;
    }
  | {
      type: "setFloor";
      floor: Set<string>;
    }
  | {
      type: "pause";
    };
const defaultTileset = { black: "⬢", white: "⬡" };

function createSolver(input: string, args: Command) {
  let moveLists = input
    .trim()
    .split("\n")
    .map(lexDirections)
    .map((ds) => ds.map((d) => hexDirections[d]));
  let finalFloor: Set<string>;
  let steps: Step[] = [];

  return {
    async part1() {
      let floor = new Set<string>();
      for (let moveList of moveLists) {
        let pos = new Axial(0, 0);
        // steps.push({ type: "highlight", pos });
        for (let move of moveList) {
          pos = pos.add(move);
          // steps.push({ type: "highlight", pos });
        }
        let key = axialToKey(pos);
        if (floor.has(key)) {
          floor.delete(key);
        } else {
          floor.add(key);
        }
        steps.push({ type: "flip", flips: [pos] });
      }
      finalFloor = new Set(floor);
      steps.push({ type: "pause" });
      return floor.size;
    },
    async part2() {
      if (!finalFloor) {
        throw new Error("Run part 1 first");
      }
      let floor = new Set(finalFloor);
      for (let day = 0; day < 100; day++) {
        let step: Step = { type: "flip", flips: [] };
        let flipRadius =
          max(...[...floor.values()].map(keyToAxial).map(distFromOrigin)) + 2;
        let newFloor = new Set<string>();
        for (let q = -flipRadius; q < flipRadius; q++) {
          let maxR = min(flipRadius, -q + flipRadius);
          for (let r = max(-flipRadius, -q - flipRadius); r < maxR; r++) {
            let pos = new Axial(q, r);
            let posKey = axialToKey(pos);
            let neighbours = countNeighbours(floor, pos);
            let tile = floor.has(posKey);
            if (tile && (neighbours === 0 || neighbours > 2)) {
              step.flips.push(pos);
            } else if (!tile && neighbours === 2) {
              newFloor.add(posKey);
              step.flips.push(pos);
            } else if (tile) {
              newFloor.add(posKey);
            }
          }
        }
        steps.push(step);
        floor = newFloor;
      }
      if (args.vis) {
        animateFloor(steps, args.vis);
      }
      return floor.size;
    },
  };
}

function distFromOrigin(pos: Axial) {
  return (abs(-pos.q) + abs(-pos.q - pos.r) + abs(-pos.r)) / 2;
}

function axialToKey(axial: Axial) {
  return `${axial.q},${axial.r}`;
}

function keyToAxial(str: string) {
  let [q, r] = str.split(",");
  return new Axial(+q, +r);
}

function countNeighbours(floor: Set<string>, pos: Axial): number {
  return (
    +!!floor.has(axialToKey(pos.add(hexDirections.e))) +
    +!!floor.has(axialToKey(pos.add(hexDirections.se))) +
    +!!floor.has(axialToKey(pos.add(hexDirections.sw))) +
    +!!floor.has(axialToKey(pos.add(hexDirections.w))) +
    +!!floor.has(axialToKey(pos.add(hexDirections.nw))) +
    +!!floor.has(axialToKey(pos.add(hexDirections.ne)))
  );
}

export class Axial {
  q: number;
  r: number;

  constructor(q: number, r: number) {
    this.q = q;
    this.r = r;
  }

  add(other: { q: number; r: number }) {
    return new Axial(this.q + other.q, this.r + other.r);
  }

  equals(other: { q: number; r: number }) {
    return this.q == other.q && this.r === other.r;
  }

  static fromOddR(oddr: { col: number; row: number }) {
    let q = oddr.col - (oddr.row - (oddr.row & 1)) / 2;
    let r = oddr.row;
    return new Axial(q, r);
  }
}

export class OddR {
  col: number;
  row: number;

  constructor(col: number, row: number) {
    this.col = col;
    this.row = row;
  }

  add(other: { col: number; row: number }) {
    return new OddR(this.col + other.col, this.row + other.row);
  }

  equals(other: { col: number; row: number }) {
    return this.col == other.col && this.row === other.row;
  }

  static fromAxial(hex: { q: number; r: number }) {
    let col = hex.q + (hex.r - (hex.r & 1)) / 2;
    let row = hex.r;
    return new OddR(col, row);
  }
}

const hexDirections = {
  e: new Axial(1, 0),
  se: new Axial(0, 1),
  sw: new Axial(-1, 1),
  w: new Axial(-1, 0),
  nw: new Axial(0, -1),
  ne: new Axial(1, -1),
};

function lexDirections(str: string): Dir[] {
  let dirs: Dir[] = [];
  let last: "n" | "s" | "" = "";
  for (let c of str) {
    if (c === "s" || c === "n") {
      last = c;
    } else if (last !== "" && (c === "e" || c === "w")) {
      dirs.push((last + c) as Dir);
      last = "";
    } else if (c === "e" || c === "w") {
      dirs.push(c as Dir);
    } else {
      throw new Error(`Unexpected char in input: '${c}'`);
    }
  }
  return dirs;
}

function floorToString(
  floor: Set<string>,
  stylize: (pos: Axial, tile: string) => string = defaultStylize,
  minSize: number = 12,
  maxSize: number = 50,
  tileSet: { black: string; white: string } = defaultTileset
) {
  // arbitrary floor map in offset coordinate system
  const centeredMap: OddR[] = [...floor.values()].map((pos) =>
    OddR.fromAxial(keyToAxial(pos))
  );

  const minRadius = trunc(minSize / 2);
  const maxRadius = trunc(maxSize / 2);

  const cols = centeredMap.map(({ col }) => col);
  const rows = centeredMap.map(({ row }) => row);
  const left = abs(min(0, ...cols));
  const top = abs(min(0, ...rows));
  const right = abs(max(0, ...cols));
  const bottom = abs(max(0, ...rows));

  const radius = min(max(left, top, right, bottom, minRadius), maxRadius);

  let width = radius * 2 + 1;
  let height = width;

  let shift = new OddR(radius, radius);

  // arbitrary floor map with smallest row and col normalised to 0
  let normalisedMap: OddR[] = centeredMap.map((coord) => coord.add(shift));

  // rectangle floor map in array of arrays, odd-r
  let concreteMap: boolean[][] = new Array(height)
    .fill(false)
    .map(() => new Array(width).fill(false));

  normalisedMap.forEach(({ col, row }) => {
    if (row < height && row > 0 && col < width && col > 0)
      concreteMap[row][col] = true;
  });

  let unshift = new OddR(-radius, -radius);
  let out = "";
  for (let y = 0; y < concreteMap.length; y++) {
    let row = concreteMap[y];
    for (let x = 0; x < row.length; x++) {
      let tile = tileSet[concreteMap[y][x] ? "black" : "white"];
      let axialPos = Axial.fromOddR(unshift.add({ col: x, row: y }));
      tile = stylize(axialPos, tile);
      out += (y & 1) ^ (radius & 1) ? " " + tile : tile + " ";
    }
    out += "\n";
  }
  return out;
}

function defaultStylize(pos: Axial, tile: string): string {
  if (pos.equals({ q: 0, r: 0 })) {
    tile = chalk.red(tile);
  } else if (pos.q === 0) {
    tile = chalk.green(tile);
  } else if (pos.r === 0) {
    tile = chalk.blue(tile);
  }
  return tile;
}

async function animateFloor(steps: Step[], speed: number = 75) {
  const pauseTime = 1000;
  await delay(speed);
  let floor = new Set<string>();
  let floorString = floorToString(floor);
  stdout.write("\n" + floorString);
  await delay(speed);
  for (let step of steps) {
    switch (step.type) {
      case "setFloor": {
        floor = step.floor;
        moveCursor(-floorString.split("\n").length + 1);
        floorString = floorToString(floor);
        stdout.write(floorString);
        await delay(speed);
        break;
      }
      case "flip": {
        let flips = step.flips;
        for (let flip of flips) {
          let key = axialToKey(flip);
          if (floor.has(key)) {
            floor.delete(key);
          } else {
            floor.add(key);
          }
        }
        moveCursor(-floorString.split("\n").length + 1);
        floorString = floorToString(floor, (pos, tile) =>
          defaultStylize(
            pos,
            flips.some((flip) => flip.equals(pos)) ? "|" : tile
          )
        );
        stdout.write(floorString);
        await delay(speed);
        moveCursor(-floorString.split("\n").length + 1);
        floorString = floorToString(floor);
        stdout.write(floorString);
        await delay(speed);
        break;
      }
      case "highlight": {
        moveCursor(-floorString.split("\n").length + 1);
        let highlightPos = step.pos;
        floorString = floorToString(floor, (pos, tile) =>
          pos.equals(highlightPos)
            ? chalk.blue(defaultTileset.black)
            : defaultStylize(pos, tile)
        );
        stdout.write(floorString);
        await delay(speed);
        break;
      }
      case "pause": {
        await delay(pauseTime);
        break;
      }
    }
  }
}

function moveCursor(dy) {
  if (stdout.moveCursor) {
    stdout.moveCursor(0, dy);
  }
}

async function delay(ms: number) {
  await timersPromises.setTimeout(ms);
}

let program = buildCommandline(testCases, createSolver);
program.option("-v, --vis [speed]", "visualise the solution");

program.parse(process.argv);
