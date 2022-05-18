import cloneDeep from "lodash.clonedeep"
import renameKey_ from "../methods/renameKey.js"
import describe_ from "../methods/describe.js"
import formatAllKeys_ from "../methods/formatAllKeys.js"
import getArray_ from "../methods/getArray.js"
import showTable_ from "../methods/showTable.js"
import checkValues_ from "../methods/checkValues.js"
import excludeMissingValues_ from "../methods/excludeMissingValues.js"
import removeKey_ from "../methods/removeKey.js"
import valuesToString_ from "../methods/valuesToString.js"
import valuesToInteger_ from "../methods/valuesToInteger.js"
import valuesToFloat_ from "../methods/valuesToFloat.js"
import valuesToDate_ from "../methods/valuesToDate.js"
import datesToString_ from "../methods/datesToString.js"
import filterValues_ from "../methods/filterValues.js"
import filterItems_ from "../methods/filterItems.js"
import roundValues_ from "../methods/roundValues.js"
import replaceValues_ from "../methods/replaceValues.js"
import addKey_ from "../methods/addKey.js"
import selectKeys_ from "../methods/selectKeys.js"
import modifyValues_ from "../methods/modifyValues.js"
import modifyItems_ from "../methods/modifyItems.js"
import sortValues_ from "../methods/sortValues.js"
import addQuantiles_ from "../methods/addQuantiles.js"
import addBins_ from "../methods/addBins.js"
import addOutliers_ from "../methods/addOutliers.js"
import excludeOutliers_ from "../methods/excludeOutliers.js"
import correlation_ from "../methods/correlation.js"
import addItems_ from "../methods/addItems.js"
import getUniqueValues_ from "../methods/getUniqueValues.js"
import summarize_ from "../methods/summarize.js"
import mergeItems_ from "../methods/mergeItems.js"
import saveData_ from "../methods/saveData.js"
import saveChart_ from "../methods/saveChart.js"
import saveCustomChart_ from "../methods/saveCustomChart.js"
import checkKeys from "../helpers/checkKeys.js"
import logCall from "../helpers/logCall.js"
import checkEnvironment from "../helpers/checkEnvironment.js"
import { SimpleDataItem } from "../types/SimpleData.types"


export default class SimpleData {

    _data: SimpleDataItem[]
    _keys: string[]
    _environment: "nodejs" | "webBrowser"
    // Logging 
    _verbose: boolean
    _logParameters: boolean
    _nbTableItemsToLog: number

    constructor(
        data: SimpleDataItem[], 
    {
        verbose = false,
        logParameters = false,
        nbTableItemsToLog = 5
    }: {
        verbose?: boolean,
        logParameters?: boolean,
        nbTableItemsToLog?: number
    } = {}) {
        checkKeys(data)

        this._data = data
        this._keys = Object.keys(data[0])

        this._verbose = verbose
        this._logParameters = logParameters
        this._nbTableItemsToLog = nbTableItemsToLog

        this._environment = checkEnvironment()
    }

    get data() {
        return this._data
    }

    set data(data) {
        this._data = data
    }

    get keys() {
        return this._keys
    }
    set keys(data) {
        this._keys = data[0] === undefined ? [] : Object.keys(data[0])
    }


    #updateSimpleData(data: SimpleDataItem[]) {
        this._data = data
        this._keys = data[0] === undefined ? [] : Object.keys(data[0])
    }

    @logCall()
    clone(): SimpleData {
        const newSimpleData = cloneDeep(this)

        return newSimpleData
    }

    @logCall()
    getArray({ key }: { key: string }): SimpleDataItem[] {
        const array = getArray_(this.data, key)

        return array
    }

    @logCall()
    getUniqueValues({ key }: { key: string }): SimpleDataItem[] {
        const uniqueValues = getUniqueValues_(this.data, key)

        return uniqueValues
    }

    @logCall()
    checkValues({ overwrite = false }: { overwrite?: boolean } = {}): SimpleData {
        const data = checkValues_(this.data)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    describe({ overwrite = false } : { overwrite?: boolean } = {}): SimpleData {
        const data = describe_(this.data)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    summarize({
        value,
        key,
        summary,
        weight,
        overwrite = false,
        nbDigits = 1,
        nbValuesTestedForTypeOf = 1000
    }: {
        value?: string,
        key?: string,
        summary?: any,
        weight?: string,
        overwrite?: boolean,
        nbDigits?: number,
        nbValuesTestedForTypeOf?: number
    } = {}): SimpleData {
        const data = summarize_(
            this._data,
            value === undefined ? this._keys : value,
            key,
            summary,
            weight,
            this._verbose,
            nbValuesTestedForTypeOf,
            nbDigits
        )
        overwrite && this.#updateSimpleData(data)
        return this
    }

    @logCall()
    correlation({ 
        key1, 
        key2, 
        overwrite = false, 
        nbDigits = 1, 
        nbValuesTestedForTypeOf = 1000 
    }: { 
        key1?: string, 
        key2?: string,  
        overwrite?: boolean, 
        nbDigits?: number, 
        nbValuesTestedForTypeOf?: number
    } = {}): SimpleData {
        const data = correlation_(
            this._data,
            this._verbose,
            nbDigits,
            nbValuesTestedForTypeOf,
            key1,
            key2,
        )
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    excludeMissingValues({ 
        key, 
        missingValues, 
        overwrite = true 
    }: { 
        key?: string, 
        missingValues?: any[], 
        overwrite?: boolean 
    } = {}): SimpleData {
        if (missingValues === undefined) {
            missingValues = [null, NaN, undefined, ""]
        }
        const data = excludeMissingValues_(
            this.data,
            key,
            missingValues,
            this._verbose
        )
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    renameKey({ oldKey, newKey, overwrite = true }: { oldKey: string, newKey: string, overwrite?: boolean }): SimpleData {
        const data = renameKey_(this._data, oldKey, newKey)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    removeKey({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleData {
        const data = removeKey_(this._data, key)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addKey({ key, func, overwrite = true }: { key: string, func: (item: any) => any, overwrite?: boolean }): SimpleData {
        const data = addKey_(this._data, key, func)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    selectKeys({ keys, overwrite = true }: { keys: string[], overwrite?: boolean }): SimpleData {
        const data = selectKeys_(this._data, keys)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    modifyValues({ key, func, overwrite = true }: { key: string, func: (val: any) => any, overwrite?: boolean }): SimpleData {
        const data = modifyValues_(this._data, key, func)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    modifyItems({ key, func, overwrite = true }: { key: string, func: (item: any) => any, overwrite?: boolean }): SimpleData {
        const data = modifyItems_(this._data, key, func)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    formatAllKeys({ overwrite = true } : { overwrite?: boolean } = {}): SimpleData {
        const data = formatAllKeys_(this._data, this._verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    valuesToString({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleData {
        const data = valuesToString_(this._data, key)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    valuesToInteger({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleData {
        const data = valuesToInteger_(this._data, key)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    valuesToFloat({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleData {
        const data = valuesToFloat_(this._data, key)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    valuesToDate({ key, format, overwrite = true }: { key: string, format: string, overwrite?: boolean }): SimpleData {
        const data = valuesToDate_(this._data, key, format)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    datesToString({ key, format, overwrite = true }: { key: string, format: string, overwrite?: boolean }): SimpleData {
        const data = datesToString_(this._data, key, format)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    filterValues({ key, func, overwrite = true }: { key: string, func: (val: any) => any, overwrite?: boolean }): SimpleData {
        const data = filterValues_(this._data, key, func, this._verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    filterItems({ func, overwrite = true }: { func: (val: any) => any, overwrite?: boolean }): SimpleData {
        const data = filterItems_(this._data, func, this._verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    roundValues({ key, nbDigits = 1, overwrite = true }: { key: string, nbDigits?: number, overwrite?: boolean }): SimpleData {
        const data = roundValues_(this._data, key, nbDigits)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    replaceValues({ 
        key, 
        oldValue, 
        newValue, 
        method = "entireString", 
        overwrite = true
    }: { 
        key: string, 
        oldValue: string, 
        newValue: string, 
        method: "entireString" | "partialString", 
        overwrite?: boolean 
    }): SimpleData {
        const data = replaceValues_(this._data, key, oldValue, newValue, method)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    sortValues({ 
        key, 
        order, 
        overwrite = true 
    }: { 
        key: string, 
        order: "ascending" | "descending", 
        overwrite?: boolean
     }): SimpleData {
        const data = sortValues_(this._data, key, order)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addQuantiles({ 
        key, 
        newKey, 
        nbQuantiles, 
        overwrite = true 
    }: { 
        key: string, 
        newKey: string, 
        nbQuantiles: number, 
        overwrite?: boolean 
    }): SimpleData {
        const data = addQuantiles_(this._data, key, newKey, nbQuantiles, this._verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addBins({ 
        key, 
        newKey, 
        nbBins, 
        overwrite = true 
    }: { 
        key: string, 
        newKey: string, 
        nbBins: number, 
        overwrite?: boolean 
    }): SimpleData {
        const data = addBins_(this._data, key, newKey, nbBins, this._verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addOutliers({ 
        key, 
        newKey, 
        overwrite = true 
    }: { 
        key: string, 
        newKey: string, 
        overwrite?: boolean 
    }): SimpleData {
        const data = addOutliers_(this._data, key, newKey, this._verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    excludeOutliers({ key, overwrite = true }: { key: string, overwrite?: boolean }): SimpleData {
        const data = excludeOutliers_(this._data, key, this._verbose)
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    addItems({ 
        dataToBeAdded, 
        nbDigits = 1, 
        overwrite = true 
    }: { 
        dataToBeAdded: SimpleDataItem[], 
        nbDigits?: number, 
        overwrite?: boolean 
    }): SimpleData {
        const data = addItems_(
            this._data,
            dataToBeAdded,
            this._verbose,
            nbDigits
        )
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    mergeItems({ 
        dataToBeMerged, 
        commonKey, 
        nbValuesTestedForTypeOf = 1000, 
        overwrite = true 
    }: { 
        dataToBeMerged: SimpleDataItem[], 
        commonKey: string, 
        nbValuesTestedForTypeOf?: 
        number, overwrite?: boolean 
    }): SimpleData {
        const data = mergeItems_(
            this._data,
            dataToBeMerged,
            commonKey,
            this._verbose,
            nbValuesTestedForTypeOf
        )
        overwrite && this.#updateSimpleData(data)

        return this
    }

    @logCall()
    saveData({ path, encoding = "utf8" }: { path: string, encoding?: BufferEncoding }): SimpleData {
        saveData_(
            this._data,
            path,
            this._verbose,
            encoding,
            this._environment
        )

        return this
    }

    @logCall()
    saveChart({path, type, x, y, color}: {path: string, type: "dot" | "line" | "bar" | "box", x: string, y: string, color?: string}) {
        const chart = saveChart_(this._data, path, type, x, y, color, this._verbose)

        return chart
    }

    @logCall()
    saveCustomChart({path, plotOptions}: {path: string, plotOptions: any}) {
        const chart = saveCustomChart_(this._data, path, plotOptions, this._verbose)

        return chart
    }

    @logCall()
    showTable({ nbItemInTable = 5 }: { nbItemInTable?: "all" | number } = {}): SimpleData {
        // TODO: test this!
        showTable_(this._data, nbItemInTable)

        return this
    }

}