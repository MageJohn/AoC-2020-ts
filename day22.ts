import { buildCommandline } from "./AoC";
import _ from "lodash";

const testCases = [
  {
    name: "Worked examples",
    input: `Player 1:
9
2
6
3
1

Player 2:
5
8
4
7
10
`,
    part1: 306,
    part2: 291,
  },
];

function createSolver(input: string) {
  let startingHands = input
    .trim()
    .split("\n\n")
    .map((hand) =>
      hand
        .split("\n")
        .slice(1)
        .map((n) => parseInt(n, 10))
    );
  return {
    part1() {
      let hands = _.cloneDeep(startingHands);
      while (hands[0].length > 0 && hands[1].length > 0) {
        let winningHand = _.maxBy(hands, (hand) => hand[0])!;
        winningHand.push(
          ...[hands[0].shift()!, hands[1].shift()!].sort((a, b) => b - a)
        );
      }
      let winningHand = hands[0].length ? hands[0] : hands[1];
      return winningHand
        .reverse()
        .reduce((score, card, i) => score + card * (i + 1));
    },
    part2() {
      let otherPlayer: { p1: "p2"; p2: "p1" } = { p1: "p2", p2: "p1" };
      function game(hands: {
        p1: Deck<number>;
        p2: Deck<number>;
      }): { winner: "p1" | "p2"; hand: Deck<number> } {
        let rounds = new Set<string>();
        while (hands.p1.size > 0 && hands.p2.size > 0) {
          let roundState = `${hands.p1.join()}:${hands.p2.join()}`;
          if (rounds.has(roundState)) {
            return { winner: "p1", hand: hands.p1 };
          } else {
            rounds.add(roundState);
          }
          let draw = { p1: hands.p1.draw()!, p2: hands.p2.draw()! };
          let winner: "p1" | "p2";
          if (hands.p1.size >= draw.p1 && hands.p2.size >= draw.p2) {
            let subGame = game({
              p1: hands.p1.copyN(draw.p1),
              p2: hands.p2.copyN(draw.p2),
            });
            winner = subGame.winner;
          } else {
            winner = draw.p1 > draw.p2 ? "p1" : "p2";
          }
          hands[winner].toBottom(draw[winner], draw[otherPlayer[winner]]);
        }
        let winner: "p1" | "p2" = hands.p1.size > 0 ? "p1" : "p2";
        return { winner, hand: hands[winner] };
      }
      return Array.from(
        game({
          p1: new Deck(startingHands[0]),
          p2: new Deck(startingHands[1]),
        }).hand
      )
        .reverse()
        .reduce((score, card, i) => score + card * (i + 1));
    },
  };
}

type Card<T> = {
  value: T;
  next: Card<T> | undefined;
};
class Deck<T> {
  top: Card<T> | undefined = undefined;
  end: Card<T> | undefined = undefined;
  size: number = 0;

  constructor(iterable?: Iterable<T>) {
    if (iterable) {
      this.toBottom(...iterable);
    }
  }
  toBottom(...args: T[]) {
    let i = 0;
    if (this.size === 0 && args.length > 0) {
      this.top = { value: args[0], next: undefined };
      this.end = this.top;
      this.size = 1;
      i++;
    }
    for (let e = args.length; i < e; i++) {
      let newEnd: Card<T> = {
        value: args[i],
        next: undefined,
      };
      this.end!.next = newEnd;
      this.end = newEnd;
      this.size++;
    }
  }
  draw(): T | undefined {
    if (this.top) {
      let { next, value } = this.top;
      this.top = next;
      this.size--;
      return value;
    }
  }

  join(sep: string = ","): string {
    let current = this.top;
    let res = "";
    if (current) {
      res += current.value;
      current = current.next;
    }
    while (current) {
      res += sep + current.value;
      current = current.next;
    }
    return res;
  }
  copyN(n: number): Deck<T> {
    let slice = new Deck<T>();
    let i = 0;
    for (let card of this) {
      if (i == n) {
        break;
      }
      slice.toBottom(card);
      i++;
    }
    return slice;
  }
  *[Symbol.iterator]() {
    let current = this.top;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}

let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
