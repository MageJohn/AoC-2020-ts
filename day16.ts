import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `class: 1-3 or 5-7
row: 6-11 or 33-44
seat: 13-40 or 45-50

your ticket:
7,1,14

nearby tickets:
7,3,47
40,4,50
55,2,20
38,6,12
`,
    part1: 71,
  },
  {
    name: "Part 2 test",
    input: `departure time: 0-1 or 4-19
row: 0-5 or 8-19
seat: 0-13 or 16-19

your ticket:
11,12,13

nearby tickets:
3,9,18
15,1,5
5,14,9`,
    part1: 0,
    part2: 12,
  },
];

type Rules = Map<string, CompositeRange>;
type Ticket = number[];

interface Data {
  rules: Rules;
  myTicket: Ticket;
  nearbyTickets: Ticket[];
}

function createSolver(input: string) {
  let [rawRules, rawMyTicket, rawNearbyTickets] = input.trim().split("\n\n");

  let rules: Rules = rawRules
    .split("\n")
    .reduce((rules: Map<string, CompositeRange>, rawRule: string) => {
      let [key, rawValue] = rawRule.split(":");
      let [rangeA, rangeB] = rawValue.split(" or ");
      return rules.set(
        key,
        new CompositeRange(Range.fromString(rangeA), Range.fromString(rangeB))
      );
    }, new Map());

  let myTicket: Ticket = parseTicket(rawMyTicket.split("\n")[1]);

  let nearbyTickets: Ticket[] = rawNearbyTickets
    .split("\n")
    .slice(1)
    .map(parseTicket);

  let data: Data = {
    rules,
    myTicket,
    nearbyTickets,
  };

  return {
    part1: function () {
      return part1(data);
    },
    part2: function () {
      return part2(data);
    },
  };
}

function part1(data: Data) {
  let errorRate = 0;
  data.nearbyTickets = data.nearbyTickets.filter((ticket) =>
    ticket.every((field) => {
      let valid = Array.from(data.rules.values()).some((range) =>
        range.has(field)
      );
      if (!valid) {
        errorRate += field;
      }
      return valid;
    })
  );
  return errorRate;
}

function part2({ rules: fieldRules, myTicket, nearbyTickets }: Data) {
  let unmatchedFields = new Map(fieldRules);
  let fieldMapping: string[] = new Array(myTicket.length);
  while (unmatchedFields.size > 0) {
    for (let i = 0, e = myTicket.length; i < e; i++) {
      let matchedFields = new Map(unmatchedFields);
      for (let ticket of nearbyTickets) {
        for (let [field, range] of unmatchedFields) {
          if (!range.has(ticket[i])) {
            matchedFields.delete(field);
          }
        }
      }
      if (matchedFields.size == 1) {
        let field = matchedFields.keys().next().value;
        unmatchedFields.delete(field);
        fieldMapping[i] = field;
      }
    }
  }

  let result = 1;
  for (let i = 0, e = fieldMapping.length; i < e; i++) {
    if (fieldMapping[i].startsWith("departure")) {
      result *= myTicket[i];
    }
  }
  return result;
}

function parseTicket(rawTicket: string): number[] {
  return rawTicket.split(",").map((n) => parseInt(n, 10));
}

class Range {
  readonly lower: number;
  readonly higher: number;

  constructor(lower: number, higher: number) {
    this.lower = lower;
    this.higher = higher;
  }

  static fromString(rangeString: string) {
    if (/\d+-\d+/.test(rangeString)) {
      let [lower, higher] = rangeString.split("-");
      return new Range(+lower, +higher);
    } else {
      throw new TypeError(`Can't create range from string: ${rangeString}`);
    }
  }

  has(num: number) {
    return num >= this.lower && num <= this.higher;
  }
}

class CompositeRange {
  readonly ranges: Range[];

  constructor(...ranges: Range[]) {
    this.ranges = ranges;
  }

  has(num: number) {
    return this.ranges.some((range) => range.has(num));
  }
}

let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
