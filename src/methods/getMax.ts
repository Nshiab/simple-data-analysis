import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"

export default async function getMax(
    simpleDB: SimpleDB,
    table: string,
    column: string,
    options: {
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetMax()")

    const queryResult = await queryDB(
        simpleDB.connection,
        simpleDB.runQuery,
        `SELECT MAX("${column}") AS valueForGetMax FROM ${table}`,
        mergeOptions(simpleDB, { ...options, table, returnDataFrom: "query" })
    )

    if (!queryResult) {
        throw new Error("No queryResults")
    }

    return queryResult[0].valueForGetMax
}