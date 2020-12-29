import { buildCommandline } from "./AoC";
import _ from "lodash";
import { performance } from "perf_hooks";

export const testCases = [
  {
    name: "Page example",
    input: `Tile 2311:
..##.#..#.
##..#.....
#...##..#.
####.#...#
##.##.###.
##...#.###
.#.#.#..##
..#....#..
###...#.#.
..###..###

Tile 1951:
#.##...##.
#.####...#
.....#..##
#...######
.##.#....#
.###.#####
###.##.##.
.###....#.
..#.#..#.#
#...##.#..

Tile 1171:
####...##.
#..##.#..#
##.#..#.#.
.###.####.
..###.####
.##....##.
.#...####.
#.##.####.
####..#...
.....##...

Tile 1427:
###.##.#..
.#..#.##..
.#.##.#..#
#.#.#.##.#
....#...##
...##..##.
...#.#####
.#.####.#.
..#..###.#
..##.#..#.

Tile 1489:
##.#.#....
..##...#..
.##..##...
..#...#...
#####...#.
#..#.#.#.#
...#.#.#..
##.#...##.
..##.##.##
###.##.#..

Tile 2473:
#....####.
#..#.##...
#.##..#...
######.#.#
.#...#.#.#
.#########
.###.#..#.
########.#
##...##.#.
..###.#.#.

Tile 2971:
..#.#....#
#...###...
#.#.###...
##.##..#..
.#####..##
.#..####.#
#..#.#..#.
..####.###
..#.#.###.
...#.#.#.#

Tile 2729:
...#.#.#.#
####.#....
..#.#.....
....#..#.#
.##..##.#.
.#.####...
####.#.#..
##.####...
##..#.##..
#.##...##.

Tile 3079:
#.#.#####.
.#..######
..#.......
######....
####.#..#.
.#...#.##.
#.#####.##
..#.###...
..#.......
..#.###...
`,
    part1: 20899048083289,
    part2: undefined,
    extra: {},
  },
];

interface Best {
  tile: TransformedTile;
  length: number;
}

export enum Transform {
  Rot0,
  Rot90,
  Rot180,
  Rot270,
  Rot0Flip,
  Rot90Flip,
  Rot180Flip,
  Rot270Flip,
}

export enum Side {
  Top,
  Right,
  Bottom,
  Left,
}
const tileSideLen = 10;

function solution(input: string) {
  let tiles = transformInput(input);
  return { part1: part1(tiles), part2: part2() };
}

export function transformInput(input: string): Tile[] {
  return _(input.trim())
    .split("\n\n")
    .map((tile) => {
      let id = +tile.slice(5, 9);
      let data = _.drop(tile, 11).join("").split("\n");
      return new Tile(id, data);
    })
    .value();
}

function part1(tiles: Tile[]) {
  let imageSide = Math.sqrt(tiles.length);
  let image: TransformedTile[][] = Array(imageSide)
    .fill(0)
    .map(() => Array(imageSide));
  function solve(row: number, col: number, tiles: Tile[]): boolean {
    if (tiles.length === 0) {
      return true;
    }

    let above = image[row - 1]?.[col]?.side(Side.Bottom) || "edge";
    let left = image[row]?.[col - 1]?.side(Side.Right) || "edge";

    let nextCol = (col + 1) % imageSide;
    let nextRow = row + +(col + 1 === imageSide);

    for (let tile of tiles) {
      for (
        let transform = Transform.Rot0;
        transform <= Transform.Rot270Flip;
        transform++
      ) {
        let transformed = new TransformedTile(tile, transform);
        if (
          (above === "edge" || above === transformed.side(Side.Top)) &&
          (left === "edge" || left === transformed.side(Side.Left))
        ) {
          image[row][col] = transformed;
          if (solve(nextRow, nextCol, _.without(tiles, tile))) {
            return true;
          }
        }
      }
    }
    return false;
  }
  let start = performance.now();
  solve(0, 0, Array.from(tiles));
  let end = performance.now();
  console.log(end - start);

  return (
    image[0][0].tile.id *
    image[imageSide - 1][0].tile.id *
    image[0][imageSide - 1].tile.id *
    image[imageSide - 1][imageSide - 1].tile.id
  );
}

function part2() {}

function printSolution(image: TransformedTile[][]) {
  for (let row of image) {
    let tileRows = _(row)
      .invokeMap(TransformedTile.prototype.toString)
      .invokeMap(String.prototype.split, "\n")
      .thru((strings) => _.zip(...strings))
      .invokeMap(Array.prototype.join, " ")
      .join("\n");
    console.log(tileRows);
  }
}

class Tile {
  id: number;
  data: string[];
  private sideLookup: number[];

  constructor(id: number, data: string[]) {
    this.id = id;
    this.data = data;

    // 8 different transforms * 4 different sides
    let sideLookup = new Array<number>(32);

    let sides = [
      this.data[0],
      this.data.reduce((side, row) => side + row[tileSideLen - 1], ""),
      this.data[tileSideLen - 1],
      this.data.reduce((side, row) => side + row[0], ""),
    ].map(Tile.sideToNum);
    let reversed = sides.reduce((reversed, side) => {
      let reversedSide = 0;
      let _side = side;
      for (let i = 0; i < tileSideLen; i++) {
        reversedSide = reversedSide * 2 + (_side % 2);
        _side = Math.trunc(_side / 2);
      }
      reversed[side] = reversedSide;
      reversed[reversedSide] = side;
      return reversed;
    }, {} as { [side: number]: number });

    for (let i = Transform.Rot0; i < Transform.Rot0Flip; i++) {
      sideLookup.splice(i * 4, 4, ...sides);

      // rotate
      sides.unshift(sides.pop()!);
      sides[Side.Bottom] = reversed[sides[Side.Bottom]];
      sides[Side.Top] = reversed[sides[Side.Top]];
    }

    for (let i = Transform.Rot0; i < Transform.Rot0Flip; i++) {
      sides = sideLookup.slice(i * 4, i * 4 + 4);

      // flip
      let left = sides[Side.Left];
      sides[Side.Left] = sides[Side.Right];
      sides[Side.Right] = left;
      sides[Side.Bottom] = reversed[sides[Side.Bottom]];
      sides[Side.Top] = reversed[sides[Side.Top]];

      sideLookup.splice((i + Transform.Rot0Flip) * 4, 4, ...sides);
    }

    this.sideLookup = sideLookup;
  }

  side(side: Side, transform: Transform) {
    return this.sideLookup[transform * 4 + side];
  }

  private static sideToNum(side: string): number {
    return Array.from(side).reduce((num, c) => {
      switch (c) {
        case "#":
          return num * 2 + 1;
        case ".":
          return num * 2;
        default:
          throw new Error(`Unexpected character: ${c}`);
      }
    }, 0);
  }

  // for debugging
  private static sideToString(side: number): string {
    let str = "";
    for (let i = 0; i < tileSideLen; i++) {
      str = (side % 2 ? "#" : ".") + str;
      side = Math.trunc(side / 2);
    }
    return str;
  }

  sidesToString(transform: Transform) {
    let sides = this.sideLookup
      .slice(transform * 4, transform * 4 + 4)
      .map(Tile.sideToString);
    let fill = Array(8).fill(" ").join("");

    let str = sides[Side.Top];
    for (let i = 1; i < tileSideLen - 1; i++) {
      str += "\n" + sides[Side.Left][i] + fill + sides[Side.Right][i];
    }
    str += "\n" + sides[Side.Bottom];
    return str;
  }

  printData() {
    this.data.forEach((line) => console.log(line));
  }

  printSides(transform: Transform) {
    console.log(this.sidesToString(transform));
  }
}

class TransformedTile {
  readonly tile: Tile;
  readonly transform: Transform;

  constructor(tile: Tile, transform: Transform) {
    this.tile = tile;
    this.transform = transform;
  }

  side(side: Side) {
    return this.tile.side(side, this.transform);
  }

  toString() {
    return this.tile.sidesToString(this.transform);
  }
}

let program = buildCommandline(solution, testCases);

program.parse(process.argv);
