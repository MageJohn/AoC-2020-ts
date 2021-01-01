import { buildCommandline } from "./AoC";
import _ from "lodash";

const testCases = [
  {
    name: "Page example",
    input: `mxmxvkd kfcds sqjhc nhms (contains dairy, fish)
trh fvjkl sbzzf mxmxvkd (contains dairy)
sqjhc fvjkl (contains soy)
sqjhc mxmxvkd sbzzf (contains fish)
`,
    part1: 5,
    part2: "mxmxvkd,sqjhc,fvjkl",
  },
];

const foodPatt = /^(?<foods>([a-z]+ )*[a-z]+) \(contains (?<allergens>([a-z]+, )*[a-z]+)\)$/;

function createSolver(input: string) {
  let foods = input
    .trim()
    .split("\n")
    .map((food) => {
      let match = foodPatt.exec(food);
      if (match && match.groups) {
        let ingredients = new Set(match.groups.foods.split(" "));
        let allergens = new Set(match.groups.allergens.split(", "));
        return { ingredients, allergens };
      } else {
        throw new Error(`Unexpected line: ${food}`);
      }
    });
  let agnToPossibleIgns = new Map<string, Set<string>>();

  return {
    part1() {
      let nonAllergenic = new Map<string, number>();

      for (let { ingredients, allergens } of foods) {
        for (let ign of ingredients) {
          let ignCount = nonAllergenic.get(ign) || 0;
          nonAllergenic.set(ign, ignCount + 1);
        }
        for (let agn of allergens) {
          let possibleIgns = agnToPossibleIgns.get(agn);
          if (possibleIgns) {
            agnToPossibleIgns.set(agn, intersection(ingredients, possibleIgns));
          } else {
            agnToPossibleIgns.set(agn, ingredients);
          }
        }
      }

      for (let possibleIgns of agnToPossibleIgns.values()) {
        for (let ign of possibleIgns) {
          nonAllergenic.delete(ign);
        }
      }
      let nonAllergenicCount = 0;
      for (let count of nonAllergenic.values()) {
        nonAllergenicCount += count;
      }
      return nonAllergenicCount;
    },

    part2() {
      let done = false;
      let agnToIdentifiedIgn: [string, string][] = [];
      while (!done) {
        done = true;
        for (let [agn, igns] of agnToPossibleIgns.entries()) {
          if (igns.size > 1) {
            for (let [, ign] of agnToIdentifiedIgn) igns.delete(ign);
          }
          if (igns.size === 1) {
            for (let ign of igns) agnToIdentifiedIgn.push([agn, ign]);
            agnToPossibleIgns.delete(agn);
          } else {
            done = false;
          }
        }
      }
      return _.sortBy(agnToIdentifiedIgn, [_.head])
        .map(([, ign]) => ign)
        .join();
    },
  };
}

function intersection<T>(sA: Set<T>, sB: Set<T>): Set<T> {
  let sC = new Set<T>();
  for (let item of sA) if (sB.has(item)) sC.add(item);
  return sC;
}

let program = buildCommandline(testCases, createSolver);

program.parse(process.argv);
