import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example 1",
    input: `light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bhttps://codegolf.stackexchange.com/questions/11880/build-a-working-game-of-tetris-in-conways-game-of-liferight white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.
`,
    part1: 4,
    part2: 32,
  },
  {
    name: "Page example 2",
    input: `shiny gold bags contain 2 dark red bags.
dark red bags contain 2 dark orange bags.
dark orange bags contain 2 dark yellow bags.
dark yellow bags contain 2 dark green bags.
dark green bags contain 2 dark blue bags.
dark blue bags contain 2 dark violet bags.
dark violet bags contain no other bags.
`,
    part2: 126,
  },
];

const OWN_BAG = "shiny gold";

type Rule = { outer: string; num: number; inner: string };

function solution(input: string) {
  let rules: Rule[] = input
    .trim()
    .split("\n")
    .reduce((arr, rule) => {
      let [outer, inners] = rule.split(" bags contain ");
      if (!/bags contain no other bags/.test(rule)) {
        inners.split(", ").forEach((bag) => {
          let match = /(\d) (\w* \w*) bags?/.exec(bag);
          if (match) {
            let [, num, inner] = match;
            arr.push({ outer, num: +num, inner });
          } else throw new Error("Invalid input");
        });
      }
      return arr;
    }, [] as Rule[]);

  return { part1: part1(rules, OWN_BAG), part2: part2(rules, OWN_BAG) };
}

function part1(rules: Rule[], bag: string) {
  let closure = new Set([bag]);
  let oldSize = 0;
  while (oldSize < closure.size) {
    oldSize = closure.size;
    rules.forEach((rule) => {
      if (closure.has(rule.inner)) {
        closure.add(rule.outer);
      }
    });
  }
  return closure.size - 1;
}

function part2(rules: Rule[], bag: string) {
  function recursive(outer: string) {
    let count = 1;
    rules.forEach((rule) => {
      if (rule.outer === outer) {
        count += rule.num * recursive(rule.inner);
      }
    });
    return count;
  }

  return recursive(bag) - 1;
}

let program = buildCommandline(solution, testCases);

program.parse(process.argv);
