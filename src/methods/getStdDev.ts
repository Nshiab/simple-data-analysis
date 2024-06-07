import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getStdDev(
    simpleWebTable: SimpleWebTable,
    column: string,
    options: {
        decimals?: number
    } = {}
) {
    const queryResult = await queryDB(
        simpleWebTable,
        typeof options.decimals === "number"
            ? `SELECT ROUND(STDDEV(${column}), ${options.decimals}) AS valueForGetStdDev FROM ${simpleWebTable.name}`
            : `SELECT STDDEV(${column}) AS valueForGetStdDev FROM ${simpleWebTable.name}`,
        mergeOptions(simpleWebTable, {
            table: simpleWebTable.name,
            returnDataFrom: "query",
            method: "getStdDev()",
            parameters: { column, options },
        })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    const result = queryResult[0].valueForGetStdDev
    simpleWebTable.debug && console.log("Standard deviation:", result)
    return result as number
}
