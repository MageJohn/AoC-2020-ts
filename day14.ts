import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Page example",
    input: `mask = XXXXXXXXXXXXXXXXXXXXXXXXXXXXX1XXXX0X
  mem[8] = 11
  mem[7] = 101
  mem[8] = 0
  `,
    part1: 165,
  },
  {
    name: "Page example 2",
    input: `mask = 000000000000000000000000000000X1001X
mem[42] = 100
mask = 00000000000000000000000000000000X0XX
mem[26] = 1
`,
    part1: 51,
    part2: 208,
  },
];

interface MaskIxn {
  op: "mask";
  mask: string;
}
interface MemIxn {
  op: "mem";
  addr: number;
  value: number;
}

type Ixn = MaskIxn | MemIxn;

function preprocess(input: string) {
  let maskRegEx = /mask = (?<mask>[X01]{36})/;
  let memRegEx = /mem\[(?<addr>\d+)] = (?<value>\d+)/;
  return input
    .trim()
    .split("\n")
    .map(function (ixn): Ixn {
      let maskMatch = maskRegEx.exec(ixn)?.groups;
      let memMatch = memRegEx.exec(ixn)?.groups;
      if (maskMatch) {
        return {
          op: "mask",
          mask: maskMatch.mask,
        };
      } else if (memMatch) {
        return {
          op: "mem",
          addr: +memMatch.addr,
          value: +memMatch.value,
        };
      } else {
        throw new Error(`Unexpected line: ${ixn}`);
      }
    });
}

function part1(prog: Ixn[]) {
  function step(
    state: {
      mem: Map<number, bigint>;
      mask: { ones: bigint; zeros: bigint };
    },
    ix: Ixn
  ) {
    if (ix.op == "mask") {
      state.mask = {
        ones: BigInt(parseInt(ix.mask.replace(/X/g, "0"), 2)),
        zeros: BigInt(parseInt(ix.mask.replace(/X/g, "1"), 2)),
      };
    } else if (ix.op == "mem") {
      state.mem.set(
        ix.addr,
        (BigInt(ix.value) & state.mask.zeros) | state.mask.ones
      );
    }
    return state;
  }
  let result = prog.reduce(step, {
    mem: new Map(),
    mask: { ones: 0n, zeros: 0n },
  });
  return Number(Array.from(result.mem.values()).reduce((a, b) => a + b));
}

function part2(prog: Ixn[]) {
  function* allCombos(addr: string): Iterable<number> {
    if (!addr.includes("X")) {
      yield parseInt(addr, 2);
    } else {
      yield* allCombos(addr.replace("X", "1"));
      yield* allCombos(addr.replace("X", "0"));
    }
  }
  function addrToString(addr: number): string {
    return (2 ** 36 + addr).toString(2).slice(1);
  }
  function maskAddr(addr: string, mask: string): string {
    let res = Array.from(addr);
    for (let i of res.keys()) {
      if (mask[i] === "X" || mask[i] === "1") {
        res[i] = mask[i];
      }
    }
    return res.join("");
  }

  function step(state: { mask: string; mem: Map<number, number> }, ix: Ixn) {
    if (ix.op === "mask") {
      state.mask = ix.mask;
    } else if (ix.op === "mem") {
      for (let addr of allCombos(maskAddr(addrToString(ix.addr), state.mask))) {
        state.mem.set(addr, ix.value);
      }
    }
    return state;
  }

  let result = prog.reduce(step, { mask: "", mem: new Map() });

  return Array.from(result.mem.values()).reduce((a, b) => a + b);
}

let program = buildCommandline(testCases, preprocess, part1, part2);

program.parse(process.argv);
