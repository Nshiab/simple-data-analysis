import getCombinations from "../helpers/getCombinations.js"
import keepNumericalColumns from "../helpers/keepNumericalColumns.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebDB from "../class/SimpleWebDB.js"
import linearRegressionQuery from "./linearRegressionQuery.js"

export default async function linearRegressions(
    SimpleWebDB: SimpleWebDB,
    table: string,
    options: {
        x?: string
        y?: string
        categories?: string | string[]
        decimals?: number
        outputTable?: string
    } = {}
) {
    const outputTable = options.outputTable ?? table

    const permutations: [string, string][] = []
    if (!options.x && !options.y) {
        const types = await SimpleWebDB.getTypes(table)
        const columns = keepNumericalColumns(types)
        const combinations = getCombinations(columns, 2)
        for (const c of combinations) {
            permutations.push(c)
            permutations.push([c[1], c[0]])
        }
    } else if (options.x && !options.y) {
        const types = await SimpleWebDB.getTypes(table)
        const columns = keepNumericalColumns(types)
        for (const col of columns) {
            if (col !== options.x) {
                permutations.push([options.x, col])
            }
        }
    } else if (options.x && options.y) {
        permutations.push([options.x, options.y])
    } else {
        throw new Error("No combinations of x and y")
    }

    await queryDB(
        SimpleWebDB,
        linearRegressionQuery(table, outputTable, permutations, options),
        mergeOptions(SimpleWebDB, {
            table: outputTable,
            method: "linearRegressions()",
            parameters: {
                table,
                options,
                "permutations (computed)": permutations,
            },
        })
    )
}
