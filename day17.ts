import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `.#.
..#
###
`,
    part1: 112,
    part2: 848,
  },
];

function preprocess(input: string) {
  let inputSideLength = input.split("\n").length;
  let initialState3d = new PocketDimension(3, inputSideLength);
  let initialState4d = new PocketDimension(4, inputSideLength);
  input
    .trim()
    .split("\n")
    .forEach((row, x) =>
      row.split("").forEach((cube, y) => {
        let state = cube == "#" ? 1 : 0;
        initialState3d.set([x, y, 0], state);
        initialState4d.set([x, y, 0, 0], state);
      })
    );
  return { initialState3d, initialState4d };
}

function part1({ initialState3d }: { initialState3d: PocketDimension }) {
  return boot(initialState3d);
}
function part2({ initialState4d }: { initialState4d: PocketDimension }) {
  return boot(initialState4d);
}

function boot(initialState: PocketDimension) {
  let state = initialState;
  for (let turn = 0; turn < 6; turn++) {
    state = step(state);
  }
  return state.sum();
}

function step(dimension: PocketDimension) {
  let window = new PocketDimension(dimension.nDims, 3);
  let windowCoords = Array.from(window.coords());
  // increase the side length by one on each end
  let stepped = new PocketDimension(dimension.nDims, dimension.sideLength + 2);

  for (let coord of stepped.coords()) {
    // adjust for changed side length
    let adjusted = coord.map((c) => c - 1);
    let neighbourCount = countNeighbours(dimension, adjusted);
    let curStatus = dimension.get(adjusted);

    let newStatus = +(
      (curStatus == 1 && (neighbourCount == 2 || neighbourCount == 3)) ||
      (curStatus == 0 && neighbourCount == 3)
    );
    stepped.set(coord, newStatus);
  }
  return stepped;

  function countNeighbours(dimension: PocketDimension, coord: number[]) {
    let count = 0;
    for (let delta of windowCoords) {
      if (delta.some((n) => n != 1)) {
        // if not the (hyper)cube being checked
        let dCoord = delta.map((n, i) => coord[i] + (n - 1));
        count += dimension.get(dCoord);
      }
    }
    return count;
  }
}

class PocketDimension {
  private _data: Int8Array;
  private _sideLength: number;
  private _nDims: number;

  constructor(nDims: number, sideLength: number) {
    this._data = new Int8Array(sideLength ** nDims);
    this._sideLength = sideLength;
    this._nDims = nDims;
  }

  get(coords: number[]) {
    if (this.checkBound(coords)) return this._data[this.coordToIndex(coords)];
    else return 0;
  }

  set(coords: number[], value: number) {
    this._data[this.coordToIndex(coords)] = value;
  }

  get nDims() {
    return this._nDims;
  }

  get sideLength() {
    return this._sideLength;
  }

  sum() {
    return this._data.reduce((sum, c) => sum + c);
  }

  *coords() {
    for (let i = 0, e = this._data.length; i < e; i++) {
      yield this.indexToCoord(i);
    }
  }

  private checkBound(coords: number[]) {
    let sideLength = this.sideLength;
    return coords.every((c) => c >= 0 && c < sideLength);
  }

  private coordToIndex(coords: number[]) {
    let index = 0;
    let sideLength = this.sideLength;
    for (let dim = 0, e = coords.length; dim < e; dim++) {
      index += sideLength ** dim * coords[dim];
    }
    return index;
  }

  private indexToCoord(index: number) {
    let coords = new Array(this.nDims);
    let sideLength = this.sideLength;
    for (let dim = this.nDims - 1; dim >= 0; dim--) {
      let coord = Math.trunc(index / sideLength ** dim);
      coords[dim] = coord;
      index -= coord * sideLength ** dim;
    }
    return coords;
  }
}

let program = buildCommandline(testCases, preprocess, part1, part2);

program.parse(process.argv);
