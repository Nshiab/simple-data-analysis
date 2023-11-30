import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleDB from "../indexWeb.js"

export default async function getFirstRow(
    simpleDB: SimpleDB,
    table: string,
    options: {
        condition?: string
    } = {}
) {
    simpleDB.debug && console.log("\ngetFirstRow()")
    const queryResult = await queryDB(
        simpleDB,
        `SELECT * FROM ${table}${
            options.condition ? ` WHERE ${options.condition}` : ""
        } LIMIT 1`,
        mergeOptions(simpleDB, { table, returnDataFrom: "query" })
    )
    if (!queryResult) {
        throw new Error("No queryResult")
    }

    return queryResult[0]
}
