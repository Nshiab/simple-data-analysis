import uniqBy from "lodash.uniqby"
import uniqWith from "lodash.uniqwith"
import isEqual from "lodash.isequal"
import { SimpleDataItem } from "../../types/SimpleData.types"
import log from "../../helpers/log.js"
import getUniqueKeys from "../../helpers/getUniqueKeys.js"
import toPercentage from "../../helpers/toPercentage.js"

export default function removeDuplicates(
    data: SimpleDataItem[],
    key?: string,
    verbose?: boolean
) {
    let result: SimpleDataItem[]
    if (key === undefined) {
        result = uniqWith(data, isEqual)
    } else {
        const uniqueKeys = getUniqueKeys(data)
        if (!uniqueKeys.includes(key)) {
            throw new Error(`${key} key is not present in data.`)
        }
        result = uniqBy(data, key)
    }

    const nbRemoved = data.length - result.length
    verbose &&
        log(
            `/!\\ Removed ${nbRemoved} duplicate items, representing ${toPercentage(
                nbRemoved,
                data.length
            )} of received items.`,
            "bgRed"
        )

    return result
}