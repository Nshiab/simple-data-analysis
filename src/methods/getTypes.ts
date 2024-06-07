import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import SimpleWebTable from "../class/SimpleWebTable.js"

export default async function getTypes(simpleWebTable: SimpleWebTable) {
    const types = await queryDB(
        simpleWebTable,
        `DESCRIBE ${simpleWebTable.name}`,
        mergeOptions(simpleWebTable, {
            table: simpleWebTable.name,
            returnDataFrom: "query",
            method: "getTypes()",
            parameters: {},
        })
    )

    const typesObj: { [key: string]: string } = {}
    if (types) {
        for (const t of types as { [key: string]: string }[]) {
            if (t.column_name) {
                typesObj[t.column_name] = t.column_type
            }
        }
    }

    simpleWebTable.debug && console.log("types:", typesObj)

    return typesObj
}
