import _ from "lodash";
import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `389125467`,
    part1: "67384529",
    part2: 149245887792,
  },
];

function createSolver(input: string) {
  let startCups = [...input.trim()].map((n) => +n);
  let max = Math.max(...startCups);
  return {
    part1() {
      let cups = new Cups(startCups, max);
      playGame(cups, 100, max);
      cups.rotateTo(1);
      return cups.toString().slice(1);
    },
    part2() {
      let cups = new Cups(startCups, 1e6);
      cups.rotateLeft();
      for (let i = max + 1; i <= 1e6; i++) {
        cups.insert([i], true);
      }
      cups.rotate();
      playGame(cups, 1e7, 1e6);
      cups.rotateTo(1);
      cups.rotate();
      let labels = cups.pickUp(2);
      return labels[0] * labels[1];
    },
  };
}

function playGame(cups: Cups, nMoves: number, max: number) {
  for (let move = 0; move < nMoves; move++) {
    let current = cups.current!;
    cups.rotate();
    let threeCups = cups.pickUp(3);
    let destination = current;
    do {
      destination = mod(destination - 2, max) + 1;
    } while (threeCups.includes(destination));
    cups.rotateTo(destination);
    cups.insert(threeCups);
    cups.rotateTo(current);
    cups.rotate();
  }
}

function mod(a: number, n: number) {
  return ((a % n) + n) % n;
}

type Cup = {
  value: number;
  next: Cup;
  prev: Cup;
};
class Cups {
  _current: Cup | undefined;
  _savedPos: Cup | undefined;
  _index: Cup[];

  constructor(iterOrArray: Iterable<number> | ArrayLike<number>, max: number) {
    this._index = new Array(max);
    if (_.isArrayLike(iterOrArray)) {
      this.insert(iterOrArray);
    } else {
      this.insert(Array.from(iterOrArray));
    }
  }
  insert(values: ArrayLike<number>, rotate = false) {
    let i = 0;
    if (!this._current && values.length > 0) {
      let newCup: Partial<Cup> = {
        value: values[i],
        next: undefined,
        prev: undefined,
      };
      this._current = newCup.next = newCup.prev = newCup as Cup;
      this._index[values[i]] = newCup as Cup;
      i++;
    }
    let current = this._current!;
    for (let e = values.length; i < e; i++) {
      let newCup: Cup = {
        value: values[i],
        next: current.next,
        prev: current,
      };
      current.next.prev = newCup;
      current.next = newCup;
      this._index[values[i]] = newCup;
      current = newCup;
    }
    if (rotate) {
      this._current = current;
    }
  }
  pickUp(n: number): number[] {
    let res: number[] = [];
    let savedPos = this._savedPos;
    let current = this._current;
    while (current && res.length < n) {
      res.push(current.value);
      current.prev.next = current.next;
      current.next.prev = current.prev;
      if (savedPos === current) {
        this._savedPos = undefined;
      }
      delete this._index[current.value];
      current = current.next;
    }
    this._current = current;
    return res;
  }
  rotate() {
    if (!this._current) {
      return;
    }
    this._current = this._current.next;
  }
  rotateLeft() {
    if (!this._current) {
      return;
    }
    this._current = this._current.prev;
  }
  rotateTo(val: number) {
    if (this._index[val]) {
      this._current = this._index[val];
      return true;
    } else {
      return false;
    }
  }

  get current() {
    return this._current?.value;
  }

  toString(sep: string = ""): string {
    let out = "";
    let iter = this.values();
    let first = iter.next();
    if (!first.done) {
      out += first.value;
    }
    for (let val of iter) {
      out += sep + val;
    }
    return out;
  }
  *values() {
    let current = this._current;
    let end = current?.prev;
    while (current && current !== end) {
      yield current.value;
      current = current.next;
    }
    if (current) yield current.value;
  }
  [Symbol.iterator] = this.values;
}
let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
