import isMissingValue from "../helpers/isMissingValue.js"
import log from "../helpers/log.js"
import percentage from "../helpers/percentage.js"
import { SimpleDataItem, Options, defaultOptions } from "../types.js"
import showTable from "./showTable.js"

export default function excludeMissingValues(data: SimpleDataItem[], key: "onAllKeys" | string, options: Options): SimpleDataItem[] {

    options = {
        ...defaultOptions,
        ...options
    }

    options.logs && log("\nexcludeMissingValues() " + key)
    options.logOptions && log("options:")
    options.logOptions && log(options)

    let filteredData: SimpleDataItem[] = []

    if (key === "onAllKeys") {
        filteredData = data.filter(d => {
            let check = true
            //@ts-ignore
            const values = Object.values(d)
            for (let val of values) {
                if (isMissingValue(val, options)) {
                    check = false
                    break
                }
            }
            return check
        })
    } else if (data[0].hasOwnProperty(key)) {
        filteredData = data.filter(d => !isMissingValue(d[key], options))
    } else {
        throw new Error("No key " + key)
    }

    const nbRemoved = data.length - filteredData.length
    options.logs && log(`/!\\ ${nbRemoved} items removed, representing ${percentage(nbRemoved, data.length, options)} of all items.`, "bgRed")
    options.logs && showTable(filteredData, options)

    return filteredData
}