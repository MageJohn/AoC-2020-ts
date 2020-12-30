import { buildCommandline } from "./AoC";
import _ from "lodash";

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
    part2: 273,
    extra: {},
  },
];

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
const borderedSideLen = 10;
const monster = [
  "                  # ",
  "#    ##    ##    ###",
  " #  #  #  #  #  #   ",
];

const monsterSections = 15;

export function preprocess(input: string) {
  let tiles = _(input.trim())
    .split("\n\n")
    .map((tile) => {
      let id = +tile.slice(5, 9);
      let data = _.drop(tile, 11).join("").split("\n");
      return new BorderedTile(id, data);
    })
    .value();
  return matchEdges(tiles);
}

function part1(imageTiles: TransformedTile[][]) {
  let endIdx = imageTiles.length - 1;
  return (
    imageTiles[0][0].tile.id *
    imageTiles[endIdx][0].tile.id *
    imageTiles[0][endIdx].tile.id *
    imageTiles[endIdx][endIdx].tile.id
  );
}

function part2(imageTiles: TransformedTile[][]) {
  let image = buildImage(imageTiles);

  let roughness = 0;
  for (let row = 0; row < image.length; row++) {
    for (let col = 0; col < image.length; col++) {
      roughness += +(image[row][col] === "#");
    }
  }

  let monsterH = monster.length;
  let monsterW = monster[0].length;
  let lastRow = image.length - monsterH + 1;
  let lastCol = image[0].length - monsterW + 1;

  for (
    let transform = Transform.Rot0;
    transform <= Transform.Rot270Flip;
    transform++
  ) {
    let rotFlipped = transformSquare(image, transform);
    for (let rs = 0; rs < lastRow; rs++) {
      for (let cs = 0; cs < lastCol; cs++) {
        let imgSection = rotFlipped
          .slice(rs, rs + monsterH)
          .map((row) => row.slice(cs, cs + monsterW));
        let sectionsFound = 0;
        for (let row = 0; row < monsterH; row++) {
          for (let col = 0; col < monsterW; col++) {
            if (imgSection[row][col] === monster[row][col]) {
              sectionsFound++;
            }
          }
        }
        if (sectionsFound === monsterSections) {
          roughness -= sectionsFound;
        }
      }
    }
  }

  return roughness;
}

function buildImage(imageTiles: TransformedTile[][]): string[] {
  return _.flatMap(imageTiles, (row) =>
    _(row)
      .invokeMap(TransformedTile.prototype.makeConcrete)
      .thru((tileRows) => _.zip(...tileRows))
      .invokeMap(Array.prototype.join, "")
      .value()
  );
}

function matchEdges(tiles: BorderedTile[]) {
  let imageSide = Math.sqrt(tiles.length);
  let image: TransformedTile[][] = Array(imageSide)
    .fill(0)
    .map(() => Array(imageSide));
  function solve(row: number, col: number, tiles: BorderedTile[]): boolean {
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
  solve(0, 0, Array.from(tiles));
  return image;
}

class TransformedTile {
  readonly tile: BorderedTile;
  readonly transform: Transform;

  constructor(tile: BorderedTile, transform: Transform) {
    this.tile = tile;
    this.transform = transform;
  }

  side(side: Side) {
    return this.tile.side(side, this.transform);
  }

  toString() {
    return this.tile.sidesToString(this.transform);
  }

  makeConcrete(): string[] {
    return transformSquare(this.tile.stripBorders(), this.transform);
  }
}

class BorderedTile {
  readonly id: number;
  readonly data: string[];
  private sideLookup: number[];

  constructor(id: number, data: string[]) {
    this.id = id;
    this.data = data;

    // 8 different transforms * 4 different sides
    let sideLookup = new Array<number>(32);

    let sides = [
      this.data[0],
      this.data.reduce((side, row) => side + row[borderedSideLen - 1], ""),
      this.data[borderedSideLen - 1],
      this.data.reduce((side, row) => side + row[0], ""),
    ].map(BorderedTile.sideToNum);
    let reversed = sides.reduce((reversed, side) => {
      let reversedSide = 0;
      let _side = side;
      for (let i = 0; i < borderedSideLen; i++) {
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

  stripBorders() {
    return _.invokeMap(
      this.data.slice(1, borderedSideLen - 1),
      String.prototype.slice,
      1,
      borderedSideLen - 1
    );
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
    for (let i = 0; i < borderedSideLen; i++) {
      str = (side % 2 ? "#" : ".") + str;
      side = Math.trunc(side / 2);
    }
    return str;
  }

  sidesToString(transform: Transform) {
    let sides = this.sideLookup
      .slice(transform * 4, transform * 4 + 4)
      .map(BorderedTile.sideToString);
    let fill = Array(8).fill(" ").join("");

    let str = sides[Side.Top];
    for (let i = 1; i < borderedSideLen - 1; i++) {
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

function transformSquare(square: string[], transform: Transform): string[] {
  let transformed = _(Array.from(square));
  switch (transform) {
    case Transform.Rot0: {
      break;
    }
    case Transform.Rot90: {
      transformed = transformed.reverse().thru(transpose);
      break;
    }
    case Transform.Rot180: {
      transformed = transformed
        .reverse()
        .map(flipString)
        .invokeMap(Array.prototype.join, "");
      break;
    }
    case Transform.Rot270: {
      transformed = transformed.thru(transpose).reverse();
      break;
    }
    case Transform.Rot0Flip: {
      transformed = transformed.map(flipString);
      break;
    }
    case Transform.Rot90Flip: {
      transformed = transformed.thru(transpose);
      break;
    }
    case Transform.Rot180Flip: {
      transformed = transformed.reverse();
      break;
    }
    case Transform.Rot270Flip: {
      transformed = transformed.reverse().thru(transpose).reverse();
      break;
    }
  }

  return transformed.value();
}

function transpose(array: string[]) {
  return _.zip(...array.map((s) => Array.from(s))).map((a) => a.join(""));
}
function flipString(str: string): string {
  return Array.prototype.reduceRight.apply(str, [
    (s, c) => s + c,
    "",
  ]) as string;
}

let program = buildCommandline(testCases, preprocess, part1, part2);

program.parse(process.argv);

// Debugging stuff
function printEdges(image: TransformedTile[][]) {
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
