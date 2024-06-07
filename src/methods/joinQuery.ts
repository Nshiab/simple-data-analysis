export default function joinQuery(
    leftTable: string,
    rightTable: string,
    commonColumn: string,
    join: "inner" | "left" | "right" | "full",
    outputTable: string
) {
    let query = `CREATE OR REPLACE TABLE ${outputTable} AS SELECT *`

    if (join === "inner") {
        query += ` FROM ${leftTable} JOIN ${rightTable}`
    } else if (join === "left") {
        query += ` FROM ${leftTable} LEFT JOIN ${rightTable}`
    } else if (join === "right") {
        query += ` FROM ${leftTable} RIGHT JOIN ${rightTable}`
    } else if (join === "full") {
        query += ` FROM ${leftTable} FULL JOIN ${rightTable}`
    } else {
        throw new Error(`Unknown ${join} join.`)
    }

    query += ` ON (${leftTable}.${commonColumn} = ${rightTable}.${commonColumn});\n`
    // Idealy, we would remove the column here. But not always the same things depending on nodeJS or web assembly version.
    // query += `ALTER TABLE ${outputTable} DROP COLUMN ${commonColumn}_1";`
    return query
}
