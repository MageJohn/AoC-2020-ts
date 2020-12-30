import { buildCommandline } from "./AoC";

const testCases = [
  {
    name: "Part 1 example",
    input: `ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm

iyr:2013 ecl:amb cid:350 eyr:2023 pid:028048884
hcl:#cfa07d byr:1929

hcl:#ae17e1 iyr:2013
eyr:2024
ecl:brn pid:760753108 byr:1931
hgt:179cm

hcl:#cfa07d eyr:2025 pid:166559648
iyr:2011 ecl:brn hgt:59in
`,
    part1: 2,
  },
  {
    name: "Part 2: all invalid",
    input: `eyr:1972 cid:100
hcl:#18171d ecl:amb hgt:170 pid:186cm iyr:2018 byr:1926

iyr:2019
hcl:#602927 eyr:1967 hgt:170cm
ecl:grn pid:012533040 byr:1946

hcl:dab227 iyr:2012
ecl:brn hgt:182cm pid:021572410 eyr:2020 byr:1992 cid:277

hgt:59cm ecl:zzz
eyr:2038 hcl:74454a iyr:2023
pid:3556412378 byr:2007
`,
    part2: 0,
  },
  {
    name: "Part 2: all valid",
    input: `pid:087499704 hgt:74in ecl:grn iyr:2012 eyr:2030 byr:1980
hcl:#623a2f

eyr:2029 ecl:blu cid:129 byr:1989
iyr:2014 pid:896056539 hcl:#a97842 hgt:165cm

hcl:#888785
hgt:164cm byr:2001 iyr:2015 cid:88
pid:545766238 ecl:hzl
eyr:2022

iyr:2010 hgt:158cm hcl:#b6652a ecl:blu byr:1944 eyr:2021 pid:093154719
`,
    part2: 4,
  },
  {
    name: "Wrong size of pid",
    input: `iyr:2010 hgt:158cm hcl:#b6652a ecl:blu byr:1944 eyr:2021 pid:0931547190
`,
    part2: 0,
  },
];

function preprocess(input: string) {
  return input.split("\n\n").map((record) =>
    record
      .trim()
      .split("\n")
      .reduce((acc: string[], cur: string) => acc.concat(cur.split(" ")), [])
      .reduce(
        (acc: Map<string, string>, cur: string) =>
          acc.set(...(cur.split(":") as [string, string])),
        new Map()
      )
  );
}

function part1(batch: Map<string, string>[]) {
  return batch.reduce(
    (acc, record) =>
      acc + +(record.size == 8 || (record.size == 7 && !record.has("cid"))),
    0
  );
}

function part2(batch: Map<string, string>[]) {
  return batch.reduce((acc, r) => {
    let byr = r.get("byr"),
      iyr = r.get("iyr"),
      eyr = r.get("eyr"),
      hgt = r.get("hgt"),
      hcl = r.get("hcl"),
      ecl = r.get("ecl"),
      pid = r.get("pid");

    if (
      byr != null &&
      iyr != null &&
      eyr != null &&
      hgt != null &&
      hcl != null &&
      ecl != null &&
      pid != null
    ) {
      let hgtInt = parseInt(hgt, 10);
      let valid =
        true &&
        +byr >= 1920 &&
        +byr <= 2002 &&
        +iyr >= 2010 &&
        +iyr <= 2020 &&
        +eyr >= 2020 &&
        +eyr <= 2030 &&
        ((hgt.endsWith("cm") && hgtInt >= 150 && hgtInt <= 193) ||
          (hgt.endsWith("in") && hgtInt >= 59 && hgtInt <= 76)) &&
        /^#[0-9a-f]{6}$/.test(hcl) &&
        ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"].includes(ecl) &&
        /^\d{9}$/.test(pid);

      return acc + +valid;
    } else {
      return acc;
    }
  }, 0);
}

let program = buildCommandline(testCases, preprocess, part1, part2);

program.parse(process.argv);
