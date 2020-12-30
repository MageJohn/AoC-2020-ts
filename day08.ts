import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6
`,
    part1: 5,
    part2: 8,
  },
];

interface Instruction {
  op: string;
  arg: number;
}

interface VM {
  ip: number;
  acc: number;
}

type Args = { prog: Instruction[]; history: Set<number> };

function preprocess(input: string): Args {
  let prog: Instruction[] = input
    .trim()
    .split("\n")
    .map((line) => {
      let [op, arg] = line.split(" ");
      return { op, arg: +arg };
    });
  return { prog, history: new Set() };
}

function part1(args: Args) {
  let { final, history } = run(args.prog);
  args.history = history;
  return final.acc;
}

function part2({ prog, history }: Args) {
  let swapper: { [key: string]: string } = { jmp: "nop", nop: "jmp" };
  for (let historicState of history) {
    if (prog[historicState].op in swapper) {
      let fixProg = [...prog];
      fixProg[historicState] = {
        op: swapper[prog[historicState].op],
        arg: prog[historicState].arg,
      };

      let { final } = run(fixProg);
      if (final.ip >= prog.length) {
        return final.acc;
      }
    }
  }
  throw new Error("No solution found: check the input");
}

function run(prog: Instruction[]) {
  let vm = { ip: 0, acc: 0 };
  let history: Set<number> = new Set();

  while (!history.has(vm.ip) && vm.ip < prog.length) {
    history.add(vm.ip);
    vm = step(vm, prog);
  }
  return { final: vm, history };
}

function step(vm: VM, prog: Instruction[]) {
  let instr = prog[vm.ip];
  switch (instr.op) {
    case "nop":
      return { ...vm, ip: vm.ip + 1 };
    case "jmp":
      return { ...vm, ip: vm.ip + instr.arg };
    case "acc":
      return { ...vm, ip: vm.ip + 1, acc: vm.acc + instr.arg };
    default:
      throw new Error(`Unknown operator: ${instr.op}`);
  }
}

let program = buildCommandline(testCases, preprocess, part1, part2);

program.parse(process.argv);
