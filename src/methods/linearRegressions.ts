import getCombinations from "../helpers/getCombinations.ts";
import keepNumericalColumns from "../helpers/keepNumericalColumns.ts";
import mergeOptions from "../helpers/mergeOptions.ts";
import queryDB from "../helpers/queryDB.ts";
import linearRegressionQuery from "./linearRegressionQuery.ts";
import type SimpleWebTable from "../class/SimpleWebTable.ts";

export default async function linearRegressions(
  simpleWebTable: SimpleWebTable,
  options: {
    x?: string;
    y?: string;
    categories?: string | string[];
    decimals?: number;
    outputTable?: string | boolean;
  } = {},
) {
  const outputTable = typeof options.outputTable === "string"
    ? options.outputTable
    : simpleWebTable.name;

  const permutations: [string, string][] = [];
  if (!options.x && !options.y) {
    const types = await simpleWebTable.getTypes();
    const columns = keepNumericalColumns(types);
    const combinations = getCombinations(columns, 2);
    for (const c of combinations) {
      permutations.push(c);
      permutations.push([c[1], c[0]]);
    }
  } else if (options.x && !options.y) {
    const types = await simpleWebTable.getTypes();
    const columns = keepNumericalColumns(types);
    for (const col of columns) {
      if (col !== options.x) {
        permutations.push([options.x, col]);
      }
    }
  } else if (options.x && options.y) {
    permutations.push([options.x, options.y]);
  } else {
    throw new Error("No combinations of x and y");
  }

  await queryDB(
    simpleWebTable,
    linearRegressionQuery(
      simpleWebTable.name,
      outputTable,
      permutations,
      options,
    ),
    mergeOptions(simpleWebTable, {
      table: outputTable,
      method: "linearRegressions()",
      parameters: {
        options,
        "permutations (computed)": permutations,
      },
    }),
  );
}
