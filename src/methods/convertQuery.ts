export default function convertQuery(
    table: string,
    columns: string[],
    columnsTypes: (
        | "integer"
        | "float"
        | "string"
        | "date"
        | "time"
        | "datetime"
        | "datetimeTz"
        | "bigint"
        | "double"
        | "varchar"
        | "timestamp"
        | "timestamp with time zone"
    )[],
    allColumns: string[],
    allTypes: {
        [key: string]: string
    },
    options: { datetimeFormat?: string; try?: boolean }
) {
    let query = `CREATE OR REPLACE TABLE ${table} AS SELECT`

    const cast = options.try ? "TRY_CAST" : "CAST"

    for (const column of allColumns) {
        const indexOf = columns.indexOf(column)
        if (indexOf === -1) {
            query += ` "${column}",`
        } else {
            const expectedType = parseType(columnsTypes[indexOf])
            const currentType = allTypes[column]
            const datetimeFormatExist =
                typeof options.datetimeFormat === "string"
            const stringToDate =
                currentType === "VARCHAR" &&
                (expectedType.includes("TIME") || expectedType.includes("DATE"))
            const dateToString =
                (currentType.toLowerCase().includes("date") ||
                    currentType.toLowerCase().includes("time")) &&
                (expectedType.includes("TIME") || expectedType.includes("DATE"))

            if (datetimeFormatExist && stringToDate) {
                query += ` strptime("${column}", '${options.datetimeFormat}') AS "${column}",`
            } else if (datetimeFormatExist && dateToString) {
                query += ` strftime("${column}", '${options.datetimeFormat}') AS "${column}",`
            } else {
                query += ` ${cast}("${columns[indexOf]}" AS ${parseType(
                    columnsTypes[indexOf]
                )}) AS "${columns[indexOf]}",`
            }
        }
    }

    query += ` FROM ${table}`

    return query
}

function parseType(
    type:
        | "integer"
        | "float"
        | "string"
        | "date"
        | "time"
        | "datetime"
        | "datetimeTz"
        | "bigint"
        | "double"
        | "varchar"
        | "timestamp"
        | "timestamp with time zone"
) {
    if (type === "integer") {
        return "BIGINT"
    } else if (type === "float") {
        return "DOUBLE"
    } else if (type === "string") {
        return "VARCHAR"
    } else if (type === "datetime") {
        return "TIMESTAMP"
    } else if (type === "datetimeTz") {
        return "TIMESTAMP WITH TIME ZONE"
    } else if (type === "time") {
        return "TIME"
    } else if (
        [
            "date",
            "time",
            "bigint",
            "double",
            "varchar",
            "timestamp",
            "timestamp with time zone",
        ].includes(type)
    ) {
        return type.toUpperCase()
    } else {
        throw new Error(`Unknown type ${type}`)
    }
}
