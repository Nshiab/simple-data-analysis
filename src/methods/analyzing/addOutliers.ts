import log from "../../helpers/log.js"
import { SimpleDataItem } from "../../types/SimpleData.types.js"
import { quantile, extent } from "d3-array"
import toPercentage from "../../helpers/toPercentage.js"
import hasKey from "../../helpers/hasKey.js"
import checkTypeOfKey from "../../helpers/checkTypeOfKey.js"

export default function addOutliers(
    data: SimpleDataItem[],
    key: string,
    newKey: string,
    nbTestedValues = 10000,
    verbose = false
): SimpleDataItem[] {
    if (!hasKey(data, key)) {
        throw new Error("No key " + key)
    }
    if (hasKey(data, newKey)) {
        throw new Error("Already a key named " + key)
    }
    if (!checkTypeOfKey(data, key, "number", 1, nbTestedValues, verbose)) {
        throw new Error(`At least one value in ${key} is not a number.`)
    }

    const values = data.map((d) => d[key]) as Iterable<number>
    const q1 = quantile(values, 0.25) as number
    const q3 = quantile(values, 0.75) as number
    const interQuartileRange = q3 - q1

    const upper = q3 + interQuartileRange * 1.5
    const lower = q1 - interQuartileRange * 1.5

    const [min, max] = extent(values)

    verbose &&
        log(
            `Min: ${min}, Lower threshold: ${lower}, Q1: ${q1}, Q3: ${q3}, Upper threshold: ${upper}, Max: ${max}`,
            "blue"
        )

    let outliers = 0

    for (let i = 0; i < data.length; i++) {
        if (
            (data[i][key] as number) < lower ||
            (data[i][key] as number) > upper
        ) {
            data[i][newKey] = true
            outliers += 1
        } else {
            data[i][newKey] = false
        }
    }

    verbose &&
        log(
            `${outliers} outliers found, representing ${toPercentage(
                outliers,
                data.length
            )} of the incoming data.`,
            "blue"
        )

    return data
}
