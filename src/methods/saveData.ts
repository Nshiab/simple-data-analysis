import getExtension from "../helpers/getExtension.js"
import log from "../helpers/log.js"
import { SimpleDataItem, Options } from "../types/SimpleData.types.js"

export default async function saveData(data: SimpleDataItem[], path: string, options: Options) {

    if (options.environment === "nodejs") {

        const fs = await import("fs")

        const extension = getExtension(path)

        if (extension === "csv") {

            const Papa = (await import("papaparse")).default

            options.logs && log("=> Csv file extension detected", "blue")
            const csvString = Papa.unparse(data)

            fs.writeFileSync(path, csvString, { encoding: options.encoding })

        } else if (extension === "json") {

            options.logs && log("=> " + extension + " file extension detected", "blue")
            fs.writeFileSync(path, JSON.stringify(data), { encoding: options.encoding })

        } else {

            throw new Error("Unknow file extension")

        }

    } else {
        throw new Error("Can't create a file locally from the browser")
    }

    options.logs && log("=> Data written to " + path, "blue")

    return data

}