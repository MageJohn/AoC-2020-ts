import _ from "lodash";
import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Part 1 full example",
    input: `0: 4 1 5
1: 2 3 | 3 2
2: 4 4 | 5 5
3: 4 5 | 5 4
4: "a"
5: "b"

ababbb
bababa
abbbab
aaabbb
aaaabbb`,
    part1: 2,
  },
  {
    name: "Part 2 example",
    input: `42: 9 14 | 10 1
9: 14 27 | 1 26
10: 23 14 | 28 1
1: "a"
11: 42 31
5: 1 14 | 15 1
19: 14 1 | 14 14
12: 24 14 | 19 1
16: 15 1 | 14 14
31: 14 17 | 1 13
6: 14 14 | 1 14
2: 1 24 | 14 4
0: 8 11
13: 14 3 | 1 12
15: 1 | 14
17: 14 2 | 1 7
23: 25 1 | 22 14
28: 16 1
4: 1 1
20: 14 14 | 1 15
3: 5 14 | 16 1
27: 1 6 | 14 18
14: "b"
21: 14 1 | 1 14
25: 1 1 | 1 14
22: 14 14
8: 42
26: 14 22 | 1 20
18: 15 15
7: 14 5 | 1 21
24: 14 1

abbbbbabbbaaaababbaabbbbabababbbabbbbbbabaaaa
bbabbbbaabaabba
babbbbaabbbbbabbbbbbaabaaabaaa
aaabbbbbbaaaabaababaabababbabaaabbababababaaa
bbbbbbbaaaabbbbaaabbabaaa
bbbababbbbaaaaaaaabbababaaababaabab
ababaaaaaabaaab
ababaaaaabbbaba
baabbaaaabbaaaababbaababb
abbbbabbbbaaaababbbbbbaaaababb
aaaaabbaabaaaaababaa
aaaabbaaaabbaaa
aaaabbaabbaaaaaaabbbabbbaaabbaabaaa
babaaabbbaaabaababbaabababaaab
aabbbbbaabbbaaaaaabbbbbababaaaaabbaaabba
`,
    part1: 3,
    part2: 12,
  },
];

function preprocess(input: string) {
  let [rawRules, rawMessages] = input.trim().split("\n\n");
  let messages = rawMessages.split("\n");
  let rules: Rule[] = _(rawRules).split("\n").flatMap(Rule.fromString).value();
  return { messages, rules };
}

function part1({ messages, rules }: { messages: string[]; rules: Rule[] }) {
  let count = 0;
  let matcher = new Matcher(rules);
  let numMessages = messages.length;
  for (let i = 0; i < numMessages; i++) {
    if (matcher.match(messages[i])) count++;
  }
  return count;
}

function part2({ messages, rules }: { messages: string[]; rules: Rule[] }) {
  let looped = Array.from(rules);
  looped.push(new Rule("8", ["42", "8"]));
  looped.push(new Rule("11", ["42", "11", "31"]));
  return part1({ messages, rules: looped });
}

class Matcher {
  rules: Rule[];
  ruleZero: number;

  constructor(rules: Rule[]) {
    this.rules = convertToCNF(rules);
    let nonTerminals: { [nT: string]: number } = {};
    for (let [num, lhs] of _.uniq(this.rules.map((r) => r.lhs)).entries()) {
      nonTerminals[lhs] = num;
    }
    for (let i = 0; i < this.rules.length; i++) {
      let rule = this.rules[i];
      this.rules[i] = new Rule(
        nonTerminals[rule.lhs],
        rule.rhs.map((sym) =>
          ["a", "b"].includes(sym) ? sym : nonTerminals[sym]
        )
      );
    }
    this.ruleZero = nonTerminals["0"];
  }

  match(message: string): boolean {
    let rules = this.rules;
    let rulesLen = rules.length;
    let msgLen = message.length;
    let table = new Table<boolean>([msgLen + 1, msgLen, rulesLen], false);

    for (let s = 0; s < msgLen; s++) {
      let c = message[s];
      for (let { lhs, rhs } of rules) {
        if (rhs.length === 1 && rhs[0] === c) {
          table.set([1, s, lhs], true);
        }
      }
    }

    for (let l = 2; l <= msgLen; l++) {
      for (let s = 0, sEnd = msgLen - l; s <= sEnd; s++) {
        for (let p = 1; p < l; p++) {
          for (let ruleI = 0; ruleI < rulesLen; ruleI++) {
            let { rhs, lhs } = rules[ruleI];
            if (rhs.length === 2) {
              if (
                table.get([p, s, rhs[0]]) &&
                table.get([l - p, s + p, rhs[1]])
              ) {
                table.set([l, s, lhs], true);
              }
            }
          }
        }
      }
    }

    return table.get([msgLen, 0, this.ruleZero]);
  }
}

function convertToCNF(rules: Rule[]): Rule[] {
  let cnfRules = Array.from(rules);

  // Eliminate right-hand sides with more than 2 nonterminals
  for (let [ruleIndex, rule] of cnfRules.entries()) {
    if (rule.rhs.length > 2) {
      let expanded: Rule[] = [];

      expanded.push(new Rule(rule.lhs, [rule.rhs[0], `${rule.lhs}_1`]));

      let i = 1;
      for (let end = rule.rhs.length - 2; i < end; i++) {
        expanded.push(
          new Rule(`${rule.lhs}_${i}`, [rule.rhs[i], `${rule.lhs}_${i + 1}`])
        );
      }

      expanded.push(
        new Rule(`${rule.lhs}_${i}`, [rule.rhs[i], rule.rhs[i + 1]])
      );

      cnfRules.splice(ruleIndex, 1, ...expanded);
    }
  }

  // Eliminate unit rules
  for (let [ruleIndex, rule] of cnfRules.entries()) {
    if (rule.rhs.length === 1 && symbolIsNonTerminal(rule.rhs[0])) {
      let expanded = [rule];
      let changed = true;
      while (changed) {
        changed = false;
        for (let [i, expandedRule] of expanded.entries()) {
          if (
            expandedRule.rhs.length === 1 &&
            symbolIsNonTerminal(expandedRule.rhs[0])
          ) {
            changed = true;
            let expandTo = cnfRules
              .filter((r) => r.lhs === expandedRule.rhs[0])
              .map((r) => new Rule(rule.lhs, r.rhs));
            expanded.splice(i, 1, ...expandTo);
          }
        }
      }
      cnfRules.splice(ruleIndex, 1, ...expanded);
    }
  }
  return cnfRules;
}

function symbolIsNonTerminal(sym: string): boolean {
  return sym !== "a" && sym !== "b";
}

class Rule {
  lhs: string;
  rhs: string[];
  private static inputMatch = /(?<lhs>\d+): (?<rhs>(\d+( \d+)*)|(?<unionLhs>\d+( \d+)*) (?<union>\|) (?<unionRhs>\d+( \d+)*)|"(?<literal>\w)")$/;

  constructor(lhs: string, rhs: string[]) {
    this.lhs = lhs;
    this.rhs = Array.from(rhs);
  }

  static fromString(rule: string): Rule[] {
    let match = Rule.inputMatch.exec(rule);
    if (match && match.groups) {
      let lhs = match.groups.lhs;
      if (match.groups.literal) {
        return [new Rule(lhs, [match.groups.literal])];
      } else if (!match.groups.union) {
        let rhs = match.groups.rhs.split(" ");
        return [new Rule(lhs, rhs)];
      } else {
        let unionLhs = match.groups.unionLhs.split(" ");
        let unionRhs = match.groups.unionRhs.split(" ");
        return [new Rule(lhs, unionLhs), new Rule(lhs, unionRhs)];
      }
    }
    throw new TypeError(`Cannot parse rule from: ${rule}`);
  }
}

class Table<T> {
  private _data: Array<T>;
  private steps: number[];
  private dimensions: number[];

  constructor(dimensions: number[], fill: T) {
    this._data = new Array<T>(dimensions.reduce((size, dim) => size * dim));
    this._data.fill(fill);
    this.dimensions = dimensions;

    this.steps = [1];
    for (let [i, dim] of dimensions.slice(0, -1).entries()) {
      this.steps.push(this.steps[i] * dim);
    }
  }

  get(coords: number[]): T {
    let steps = this.steps;
    return this._data[
      steps[0] * coords[0] + steps[1] * coords[1] + steps[2] * coords[2]
    ];
  }

  set(coords: number[], value: T): void {
    let steps = this.steps;
    this._data[
      steps[0] * coords[0] + steps[1] * coords[1] + steps[2] * coords[2]
    ] = value;
  }
}

let program = buildCommandline(testCases, preprocess, part1, part2);

program.parse(process.argv);
