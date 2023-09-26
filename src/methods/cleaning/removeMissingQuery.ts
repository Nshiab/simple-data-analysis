export default function removeMissingQuery(
    table: string,
    allColumns: string[],
    columns: string[],
    options: {
        otherMissingValues?: (string | number)[]
        invert?: boolean
    } = {}
) {
    let query = `CREATE OR REPLACE TABLE ${table} AS SELECT ${allColumns
        .map((d) => `"${d}"`)
        .join(", ")} FROM ${table}
        WHERE`

    if (options.invert) {
        for (let i = 0; i < columns.length; i++) {
            query += `\n"${columns[i]}" IS NULL OR`
            if (options.otherMissingValues) {
                for (const otherMissingValue of options.otherMissingValues) {
                    if (typeof otherMissingValue === "string") {
                        query += `\n"${columns[i]}" = '${otherMissingValue}' OR`
                    } else if (typeof otherMissingValue === "number") {
                        query += `\n"${columns[i]}" = ${otherMissingValue} OR`
                    }
                }
            }
        }
    } else {
        for (let i = 0; i < columns.length; i++) {
            query += `\n"${columns[i]}" IS NOT NULL AND`
            if (options.otherMissingValues) {
                for (const otherMissingValue of options.otherMissingValues) {
                    if (typeof otherMissingValue === "string") {
                        query += `\n"${columns[i]}" != '${otherMissingValue}' AND`
                    } else if (typeof otherMissingValue === "number") {
                        query += `\n"${columns[i]}"! = ${otherMissingValue} AND`
                    }
                }
            }
        }
    }

    return options.invert
        ? query.slice(0, query.length - 3)
        : query.slice(0, query.length - 4)
}
