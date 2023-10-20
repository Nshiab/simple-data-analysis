import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import { SimpleDB } from "../indexWeb.js"

export default async function getBottom(
    simpleDB: SimpleDB,
    table: string,
    count: number,
    options: {
        originalOrder?: boolean
        debug?: boolean
    } = {}
) {
    ;(options.debug || simpleDB.debug) && console.log("\ngetBottom()")

    const queryResult = await queryDB(
        simpleDB.connection,
        simpleDB.runQuery,
        `WITH numberedRowsForGetBottom AS (
                SELECT *, row_number() OVER () as rowNumberForGetBottom FROM ${table}
            )
            SELECT * FROM numberedRowsForGetBottom ORDER BY rowNumberForGetBottom DESC LIMIT ${count};`,
        mergeOptions(simpleDB, { ...options, table, returnDataFrom: "query" })
    )

    if (!queryResult) {
        throw new Error("No queryResult")
    }

    const rows = queryResult.map((d) => {
        delete d.rowNumberForGetBottom
        return d
    })

    return options.originalOrder ? rows.reverse() : rows
}
