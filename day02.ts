import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `1-3 a: abcde
1-3 b: cdefg
2-9 c: ccccccccc`,
    part1: 2,
    part2: 1,
  },
];

interface Record {
  policy: {
    lower: number;
    upper: number;
    char: string;
  };
  pwd: string;
}

function solution(input: string) {
  let db: Record[] = input
    .trim()
    .split("\n")
    .map((record) => {
      let [rawPolicy, pwd] = record.split(": ");
      let [range, char] = rawPolicy.split(" ");
      let [lower, upper] = range.split("-");
      let policy = { lower: +lower, upper: +upper, char: char };

      return { policy: policy, pwd: pwd };
    });

  let solution1 = part1(db);
  let solution2 = part2(db);
  return { part1: solution1, part2: solution2 };
}

function part1(db: Record[]) {
  let validCount = 0;
  db.forEach((record) => {
    let charCount = [].filter.call(
      record.pwd,
      (char) => char == record.policy.char
    ).length;
    if (charCount >= record.policy.lower && charCount <= record.policy.upper) {
      validCount++;
    }
  });
  return validCount;
}

function part2(db: Record[]) {
  let validCount = 0;
  db.forEach((record) => {
    let {
      policy: { lower: a, upper: b, char },
      pwd,
    } = record;
    a--;
    b--;
    if (pwd[a] == char ? !(pwd[b] == char) : pwd[b] == char) {
      validCount++;
    }
  });
  return validCount;
}

let program = buildCommandline(solution, testCases);

program.parse(process.argv);
