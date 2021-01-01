import { buildCommandline } from "./AoC";
import _ from "lodash";

const testCases = [
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
  },
];

enum Transform {
  Rot0,
  Rot90,
  Rot180,
  Rot270,
  Rot0Flip,
  Rot90Flip,
  Rot180Flip,
  Rot270Flip,
}

enum Side {
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

interface Args {
  tiles: BorderedTile[];
  image: TransformedTile[][] | null;
}

function createSolver(input: string) {
  let tiles = _(input.trim())
    .split("\n\n")
    .map((tile) => {
      let id = +tile.slice(5, 9);
      let data = tile.slice(11).split("\n");
      return new BorderedTile(id, data);
    })
    .value();
  return {
    tiles,
    image: null,
    part1: function () {
      return part1(this);
    },
    part2: function () {
      return part2(this);
    },
  };
}

function part1(args: Args) {
  let imageSide = Math.sqrt(args.tiles.length);
  let image: TransformedTile[][] = Array(imageSide)
    .fill(0)
    .map(() => Array(imageSide));
  function* cellOrderGenerator() {
    for (let dr = 0, dc = 0; dr < imageSide; dr++, dc++) {
      yield [dr, dc];
      for (let row = dr + 1; row < imageSide; row++) {
        yield [row, dc];
      }
      for (let col = dc + 1; col < imageSide; col++) {
        yield [dr, col];
      }
    }
  }
  let cells = Array.from(cellOrderGenerator());
  function solve(cell: number, tiles: BorderedTile[]): boolean {
    if (tiles.length === 0) {
      return true;
    }

    let [row, col] = cells[cell];

    let above = image[row - 1]?.[col]?.side(Side.Bottom);
    let left = image[row]?.[col - 1]?.side(Side.Right);

    for (let i = 0, e = tiles.length; i < e; i++) {
      let tile = tiles[i];
      for (let tr = Transform.Rot0; tr <= Transform.Rot270Flip; tr++) {
        let transformed = new TransformedTile(tile, tr);
        if (
          (above == null || above === transformed.side(Side.Top)) &&
          (left == null || left === transformed.side(Side.Left))
        ) {
          image[row][col] = transformed;
          let without = tiles.slice(0, i).concat(tiles.slice(i + 1));
          if (solve(cell + 1, without)) {
            return true;
          }
        }
      }
    }
    return false;
  }
  let res = solve(0, Array.from(args.tiles));
  if (!res) {
    throw new Error("No solution found");
  }
  args.image = image;
  let endIdx = image.length - 1;
  return (
    image[0][0].tile.id *
    image[endIdx][0].tile.id *
    image[0][endIdx].tile.id *
    image[endIdx][endIdx].tile.id
  );
}

function part2({ image: imageTiles }: Args) {
  if (imageTiles == null) throw new Error("No image passed");
  let image = buildImage(imageTiles);
  let imgLen = image.length;

  let roughness = 0;
  for (let row = 0; row < imgLen; row++) {
    let imgRow = image[row];
    for (let col = 0; col < imgLen; col++) {
      roughness += +(imgRow[col] === "#");
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
        let sectionsFound = 0;
        for (let row = 0; row < monsterH; row++) {
          let rfRow = rotFlipped[row + rs];
          for (let col = 0; col < monsterW; col++) {
            if (rfRow[col + cs] === monster[row][col]) {
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
      transformed = transformed.reverse().map(flipString);
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
  return _.unzip(array.map((s) => Array.from(s))).map((a) => a.join(""));
}
function flipString(str: string): string {
  return Array.prototype.reduceRight.apply(str, [
    (s, c) => s + c,
    "",
  ]) as string;
}

let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
