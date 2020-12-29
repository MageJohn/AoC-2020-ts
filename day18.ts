import { buildCommandline } from "./AoC";

// Tests
/*------*/
const testCases = [
  {
    name: "Example 1",
    input: `1 + 2 * 3 + 4 * 5 + 6`,
    part1: 71,
    part2: 231,
  },
  {
    name: "Example 2",
    input: `1 + (2 * 3) + (4 * (5 + 6))`,
    part1: 51,
    part2: 51,
  },
  {
    name: "Example 3",
    input: `2 * 3 + (4 * 5)`,
    part1: 26,
    part2: 46,
  },
  {
    name: "Example 4",
    input: `5 + (8 * 3 + 9 + 3 * 4 * 3)`,
    part1: 437,
    part2: 1445,
  },
  {
    name: "Example 5",
    input: `5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))`,
    part1: 12240,
    part2: 669060,
  },
  {
    name: "Example 6",
    input: `((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2`,
    part1: 13632,
    part2: 23340,
  },
];

// Typing
/*-------*/
type Operator = "+" | "*";
type Paren = "(" | ")";
type Token = number | Operator | Paren;
type OperatorPrecedence = {
  [op in Operator]: number;
};

function isOperator(token?: Token): token is Operator {
  return typeof token === "string" && ["+", "*"].includes(token);
}
function isParen(token?: Token): token is Paren {
  return typeof token === "string" && ["(", ")"].includes(token);
}

// Solution
/*---------*/
function solution(input: string) {
  let problems = input.trim().split("\n").map(lex);
  let part1 = problems
    .map(parseToRpn.bind(undefined, { "+": 0, "*": 0 }))
    .map(evalRpn)
    .reduce((a, b) => a + b);
  let part2 = problems
    .map(parseToRpn.bind(undefined, { "+": 1, "*": 0 }))
    .map(evalRpn)
    .reduce((a, b) => a + b);
  return { part1, part2 };
}

function evalRpn(expression: Token[]): number {
  let stack = expression.reduce((stack, token, i) => {
    if (typeof token === "number") {
      stack.push(token);
    } else if (token === "+") {
      if (stack.length >= 2) {
        stack.push((stack.pop() as number) + (stack.pop() as number));
      } else {
        throw new Error(`Not enough arguments for '+' at index ${i}`);
      }
    } else if (token === "*") {
      if (stack.length >= 2) {
        stack.push((stack.pop() as number) * (stack.pop() as number));
      } else {
        throw new Error(`Not enough arguments for '*' at index ${i}`);
      }
    }
    return stack;
  }, [] as number[]);
  if (stack.length === 1) {
    return stack[0];
  } else {
    throw new Error(`Too many numbers in stack: ${stack}`);
  }
}

// Shunting yard algorithm
function parseToRpn(
  precedence: OperatorPrecedence,
  expression: Token[]
): Token[] {
  let state = expression.reduce(
    (state, token) => {
      if (typeof token === "number") {
        state.output.push(token);
      } else if (isOperator(token)) {
        let stackTop;
        while (
          isOperator((stackTop = state.stack.pop())) &&
          precedence[stackTop] >= precedence[token]
        ) {
          state.output.push(stackTop);
        }
        if (stackTop) state.stack.push(stackTop);
        state.stack.push(token);
      } else if (token === "(") {
        state.stack.push(token);
      } else if (token === ")") {
        let stackTop;
        while (isOperator((stackTop = state.stack.pop()))) {
          state.output.push(stackTop);
        }
        if (!isParen(stackTop)) {
          throw new Error("Unmatched parentheses");
        }
      }
      return state;
    },
    {
      output: [] as Token[],
      stack: [] as (Operator | "(")[],
    }
  );
  for (let operator of state.stack.reverse()) {
    if (isParen(operator)) throw new Error("Unmatched parentheses");
    state.output.push(operator);
  }
  return state.output;
}

function lex(expression: string): Token[] {
  let tokens: Token[] = [];
  for (let i = 0; i < expression.length; ) {
    let c = expression[i];
    switch (c) {
      case " ":
        i++;
        break;
      case "+":
      case "*":
      case "(":
      case ")":
        tokens.push(c);
        i++;
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9": {
        let num = 0;
        for (; /\d/.test(expression[i]); i++) {
          num = num * 10 + +expression[i];
        }
        tokens.push(num);
        break;
      }
      default:
        throw new Error("Unexpected character: " + expression[i]);
    }
  }
  return tokens;
}

let program = buildCommandline(solution, testCases);

program.parse(process.argv);
