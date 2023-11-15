import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm"
import { Database, Connection } from "duckdb"
import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import stringToArray from "../helpers/stringToArray.js"

import getDescription from "../methods/getDescription.js"
import renameColumnQuery from "../methods/renameColumnQuery.js"
import replaceStringsQuery from "../methods/replaceStringsQuery.js"
import convertQuery from "../methods/convertQuery.js"
import roundQuery from "../methods/roundQuery.js"
import joinQuery from "../methods/joinQuery.js"
import insertRowsQuery from "../methods/insertRowsQuery.js"
import sortQuery from "../methods/sortQuery.js"
import loadArrayQuery from "../methods/loadArrayQuery.js"
import outliersIQRQuery from "../methods/outliersIQRQuery.js"
import zScoreQuery from "../methods/zScoreQuery.js"
import tableToArrayOfObjects from "../helpers/arraysToData.js"
import parseType from "../helpers/parseTypes.js"
import concatenateQuery from "../methods/concatenateQuery.js"
import loadDataBrowser from "../methods/loadDataBrowser.js"
import removeMissing from "../methods/removeMissing.js"
import summarize from "../methods/summarize.js"
import correlations from "../methods/correlations.js"
import linearRegressions from "../methods/linearRegressions.js"
import getTables from "../methods/getTables.js"
import getColumns from "../methods/getColumns.js"
import getLength from "../methods/getLength.js"
import getTypes from "../methods/getTypes.js"
import getValues from "../methods/getValues.js"
import getUniques from "../methods/getUniques.js"
import getFirstRow from "../methods/getFirstRow.js"
import getLastRow from "../methods/getLastRow.js"
import getTop from "../methods/getTop.js"
import getBottom from "../methods/getBottom.js"
import getMin from "../methods/getMin.js"
import getMax from "../methods/getMax.js"
import getMean from "../methods/getMean.js"
import getMedian from "../methods/getMedian.js"
import getSum from "../methods/getSum.js"
import getSkew from "../methods/getSkew.js"
import getStdDev from "../methods/getStdDev.js"
import getVar from "../methods/getVar.js"
import getQuantile from "../methods/getQuantile.js"
import ranksQuery from "../methods/ranksQuery.js"
import quantilesQuery from "../methods/quantilesQuery.js"
import binsQuery from "../methods/binsQuery.js"
import proportionsHorizontalQuery from "../methods/proportionsHorizontalQuery.js"
import proportionsVerticalQuery from "../methods/proportionsVerticalQuery.js"
import { Data } from "@observablehq/plot"

/**
 * SimpleDB is a class that provides a simplified interface for working with DuckDB,
 * a high-performance, in-memory analytical database. This class is meant to be used
 * in a web browser. For NodeJS and other runtimes, use SimpleNodeDB.
 *
 * Here's how to instantiate and start a SimpleDB instance.
 *
 * ```ts
 * const sdb = await new SimpleDB().start()
 * ```
 */

export default class SimpleDB {
    debug: boolean
    nbRowsToLog: number
    db!: AsyncDuckDB | Database
    connection!: AsyncDuckDBConnection | Connection
    worker!: Worker | null
    runQuery!: (
        query: string,
        connection: AsyncDuckDBConnection | Connection,
        returnDataFromQuery: boolean
    ) => Promise<
        | {
              [key: string]: number | string | Date | boolean | null
          }[]
        | null
    >

    /**
     * Creates an instance of SimpleDB.
     * @param options - An optional object with configuration options:
     *   - debug: A flag indicating whether debugging information should be logged. Defaults to false.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to 10.
     *
     * After instantiating, you'll need to call the start method.
     *
     * ```ts
     * const sdb = await new SimpleDB().start()
     * ```
     */

    constructor(
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        this.nbRowsToLog = options.nbRowsToLog ?? 10
        this.debug = options.debug ?? false
        this.worker = null
        this.runQuery = async function (
            query: string,
            connection: AsyncDuckDBConnection | Connection,
            returnDataFromQuery: boolean
        ) {
            if (returnDataFromQuery) {
                const data = await (connection as AsyncDuckDBConnection).query(
                    query
                )
                return tableToArrayOfObjects(data)
            } else {
                await (connection as AsyncDuckDBConnection).query(query)
                return null
            }
        }
    }

    /**
     * Initializes DuckDB and establishes a connection to the database.
     */
    async start() {
        this.debug && console.log("\nstart()")
        const duckDB = await getDuckDB()
        this.db = duckDB.db
        this.connection = await this.db.connect()

        this.worker = duckDB.worker
        return this
    }

    /**
     * Creates a new table and loads an array of objects into it.
     *
     * ```ts
     * const data = [{letter: "a", number: 1}, {letter: "b", number: 2}]
     * await simpleDB.loadArray("tableName", data)
     * ```
     *
     * @param table - The name of the table to be created.
     * @param arrayOfObjects - An array of objects representing the data.
     * @param options - An optional object with configuration options:
     *   - replace: A boolean indicating whether to replace the table if it already exists. Defaults to false.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async loadArray(
        table: string,
        arrayOfObjects: { [key: string]: unknown }[],
        options: {
            replace?: boolean
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nloadArray()")

        return await queryDB(
            this.connection,
            this.runQuery,
            loadArrayQuery(table, arrayOfObjects, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Creates a table and loads data from an external file into it.
     *
     * ```ts
     * await simpleDB.loadData("tableName", "https://some-website.com/some-data.csv")
     * ```
     *
     * @param table - The name of the new table.
     * @param url - The URL of the external file containing the data.
     * @param options - An optional object with configuration options:
     *   - fileType: The type of the external file (csv, dsv, json, parquet). Defaults to the file extension.
     *   - autoDetect: A boolean indicating whether to automatically detect the data format. Defaults to true.
     *   - header: A boolean indicating whether the file contains a header row. Applicable for CSV files. Defaults to true.
     *   - delim: The delimiter used in the file. Applicable for DSV files. Defaults to ",".
     *   - skip: The number of rows to skip at the beginning of the file. Defaults to 0.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async loadData(
        table: string,
        url: string,
        options: {
            fileType?: "csv" | "dsv" | "json" | "parquet"
            autoDetect?: boolean
            // csv options
            header?: boolean
            delim?: string
            skip?: number
            // others
            returnDataFrom?: "table" | "query" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ): Promise<
        | {
              [key: string]: string | number | boolean | Date | null
          }[]
        | null
    > {
        return await loadDataBrowser(this, table, url, options)
    }

    /**
     * Inserts rows into a specified table.
     *
     * ```ts
     * const rows = [ { letter: "a", number: 1 }, { letter: "b", number: 2 }]
     * await sdb.insertRows("tableName", rows)
     * ```
     *
     * @param table - The name of the table to insert rows into.
     * @param rows - An array of objects representing the rows to be inserted into the table.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async insertRows(
        table: string,
        rows: { [key: string]: unknown }[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ninsertRows()")

        return await queryDB(
            this.connection,
            this.runQuery,
            insertRowsQuery(table, rows),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Inserts all rows from one table into another specified table.
     *
     * ```ts
     * // Insert all rows from tableB into tableA.
     * await sdb.insertTable("tableA", "tableB")
     * ```
     *
     * @param table - The name of the table to insert rows into.
     * @param tableToInsert - The name of the table from which rows will be inserted.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async insertTable(
        table: string,
        tableToInsert: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ninsertTable()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `INSERT INTO ${table} SELECT * FROM ${tableToInsert}`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Clones a table by creating a new table with the same structure and data.
     *
     * ```ts
     * // tableA data is cloned into tableB.
     * await sdb.cloneTable("tableA", "tableB")
     * ```
     *
     * @param originalTable - The name of the table to be cloned.
     * @param newTable - The name of the new table that will be created as a clone.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async cloneTable(
        originalTable: string,
        newTable: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ncloneTable()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${newTable} AS SELECT * FROM ${originalTable}`,
            mergeOptions(this, { ...options, table: newTable })
        )
    }

    /**
     * Selects specific columns in a table and removes the others.
     *
     * ```ts
     * // Selecting only the columns firstName and lastName from tableA. All other columns in the table will be removed.
     * await sdb.selectColumns("tableA", ["firstName", "lastName"])
     * ```
     * @param table - The name of the table from which columns will be selected.
     * @param columns - Either a string (one column) or an array of strings (multiple columns) representing the columns to be selected.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async selectColumns(
        table: string,
        columns: string | string[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nselectColumns()")

        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT ${stringToArray(columns)
                .map((d) => `"${d}"`)
                .join(", ")} FROM ${table}`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Selects random rows from a table and removes the others.
     *
     * ```ts
     * // Selecting 100 random rows in tableA
     * await sdb.sample("tableA", 100)
     *
     * // Selecting 10% of the rows randomly in tableB
     * await sdb.sample("tableB", "10%")
     * ```
     *
     * @param table - The name of the table from which rows will be sampled.
     * @param quantity - The number of rows (1000 for example) or a string ("10%" for example) specifying the sampling size.
     * @param options - An optional object with configuration options:
     *   - seed: A number specifying the seed for repeatable sampling. For example, setting it to 1 will ensure that the random rows will be the same each time you run the method.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async sample(
        table: string,
        quantity: number | string,
        options: {
            seed?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nsample()")

        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ${table} USING SAMPLE RESERVOIR(${
                typeof quantity === "number" ? `${quantity} ROWS` : quantity
            })${
                typeof options.seed === "number"
                    ? ` REPEATABLE(${options.seed})`
                    : ""
            }`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Renames columns in a specified table.
     *
     * ```ts
     * // Renaming "How old?" to "age" and "Man or woman?" to "sex" in tableA.
     * await sdb.renameColumns("tableA", {"How old?" : "age", "Man or woman?": "sex"})
     * ```
     *
     * @param table - The table in which columns will be renamed.
     * @param names - An object mapping old column names to new column names.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async renameColumns(
        table: string,
        names: { [key: string]: string },
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nrenameColumns()")

        return await queryDB(
            this.connection,
            this.runQuery,
            renameColumnQuery(table, Object.keys(names), Object.values(names)),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Restructures a table by stacking values. Useful to tidy up data.
     *
     * As an example, let's use this as tableA. Let's say it shows the number of employees per year in different departments.
     *
     * | Department | 2021 | 2022 | 2023 |
     * | ---------- | ---- | ---- | ---- |
     * | Accounting | 10   | 9    | 15   |
     * | Sales      | 52   | 75   | 98   |
     *
     * We restructure it by putting all years into a column *Year* and the employees counts into a column *Employees*.
     *
     * ```ts
     * await sdb.longer("tableA", ["2021", "2022", "2023"], "year", "employees")
     * ```
     *
     * Now, the table looks like this and is longer.
     *
     * | Department | Year | Employees |
     * | ---------- | ---- | --------- |
     * | Accounting | 2021 | 10        |
     * | Accounting | 2022 | 9         |
     * | Accounting | 2023 | 15        |
     * | Sales      | 2021 | 52        |
     * | Sales      | 2022 | 75        |
     * | Sales      | 2023 | 98        |
     *
     * @param table - The name of the table to be restructured.
     * @param columns - The column names (and associated values) that we want to stack.
     * @param columnsTo - The new column in which the stacked columns' names will be put into.
     * @param valuesTo - The new column in which the stacked columns' values will be put into.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async longer(
        table: string,
        columns: string[],
        columnsTo: string,
        valuesTo: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nlonger()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM (UNPIVOT ${table}
        ON ${columns.map((d) => `"${d}"`).join(", ")}
        INTO
            NAME ${columnsTo}
            VALUE ${valuesTo})`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Restructures a table by unstacking values.
     *
     * As an example, let's use this as tableA. Let's say it shows the number of employees per year in different departments.
     *
     * | Department | Year | Employees |
     * | ---------- | ---- | --------- |
     * | Accounting | 2021 | 10        |
     * | Accounting | 2022 | 9         |
     * | Accounting | 2023 | 15        |
     * | Sales      | 2021 | 52        |
     * | Sales      | 2022 | 75        |
     * | Sales      | 2023 | 98        |
     *
     * We restructure it by making a new column for each year and with the associated employees counts as values.
     *
     * ```ts
     * await sdb.longer("tableA", "Year", "Employees")
     * ```
     *
     * Now, the table looks like this and is wider.
     *
     * | Department | 2021 | 2022 | 2023 |
     * | ---------- | ---- | ---- | ---- |
     * | Accounting | 10   | 9    | 15   |
     * | Sales      | 52   | 75   | 98   |
     *
     * @param table - The name of the table to be restructured.
     * @param columnsFrom - The column containing the values that will be transformed as columns.
     * @param valuesFrom - The column containing values to be spread across the new columns.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async wider(
        table: string,
        columnsFrom: string,
        valuesFrom: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nwider()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM (PIVOT ${table} ON "${columnsFrom}" USING FIRST("${valuesFrom}"))`,
            mergeOptions(this, { ...options, table })
        )
    }
    /**
     * Removes duplicate rows from a table, keeping only unique rows.
     *
     * ```ts
     * await sdb.removeDuplicates("someTable")
     * ```
     *
     * @param table - The name of the table from which duplicates will be removed.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async removeDuplicates(
        table: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nremoveDuplicates()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT DISTINCT * FROM ${table}`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Removes rows with missing values from a table. By default, missing values are NULL (as an SQL value), but also "null", "NaN" and "undefined" than might have been converted to strings before being loaded into the table. Empty strings ("") are also considered missing values.
     *
     * ```ts
     * // Removes rows with missing values in any columns.
     * await sdb.removeMissing("tableA")
     *
     * // Removes rows with missing values in specific columns.
     * await sdb.removeMissing("tableA", { columns: ["firstName", "lastName"]})
     * ```
     *
     * @param table - The name of the table from which rows with missing values will be removed.
     * @param options - An optional object with configuration options:
     *   - columns: Either a string or an array of strings specifying the columns to consider for missing values. By default, all columns are considered.
     *   - missingValues: An array of values to be treated as missing values. Defaults to ["undefined", "NaN", "null", ""].
     *   - invert: A boolean indicating whether to invert the condition, keeping only rows with missing values. Defaults to false.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async removeMissing(
        table: string,
        options: {
            columns?: string | string[]
            missingValues?: (string | number)[]
            invert?: boolean
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {
            missingValues: ["undefined", "NaN", "null", ""],
        }
    ) {
        return await removeMissing(this, table, options)
    }

    /**
     * Replaces specified strings in the selected columns of a table.
     *
     *```ts
     * // Replaces entire strings and substrings too.
     * await sdb.replaceStrings("tableA", "column1", {"kilograms": "kg", liters: "l" })
     *
     * // Replaces only if matching entire string.
     * await sdb.replaceStrings("tableA", "column1", {"kilograms": "kg", liters: "l" }, {entireString: true})
     * ```
     *
     * @param table - The name of the table in which strings will be replaced.
     * @param columns - Either a string or an array of strings specifying the columns where string replacements will occur.
     * @param strings - An object mapping old strings to new strings.
     * @param options - An optional object with configuration options:
     *   - entireString: A boolean indicating whether the entire string must match for replacement. Defaults to false.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async replaceStrings(
        table: string,
        columns: string | string[],
        strings: { [key: string]: string },
        options: {
            entireString?: boolean
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nreplaceStrings()")
        options.entireString = options.entireString ?? false
        return await queryDB(
            this.connection,
            this.runQuery,
            replaceStringsQuery(
                table,
                stringToArray(columns),
                Object.keys(strings),
                Object.values(strings),
                options
            ),
            mergeOptions(this, {
                ...options,
                table,
            })
        )
    }

    /**
     * Concatenates values from specified columns into a new column in a table.
     *
     * ```ts
     * // Concatenates values from column1 and column2 into column3
     * await sdb.concatenate("tableA", ["column1", "column2"], "column3")
     *
     * // Same thing, but the values will be separated by a dash
     * await sdb.concatenate("tableA", ["column1", "column2"], "column3", {separator: "-"})
     * ```
     *
     * @param table - The name of the table where concatenation will occur.
     * @param columns - An array of column names from which values will be concatenated.
     * @param newColumn - The name of the new column to store the concatenated values.
     * @param options - An optional object with configuration options:
     *   - separator: The string used to separate concatenated values. Defaults to an empty string.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async concatenate(
        table: string,
        columns: string[],
        newColumn: string,
        options: {
            separator?: string
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nconcatenate()")
        return await queryDB(
            this.connection,
            this.runQuery,
            concatenateQuery(table, columns, newColumn, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Filters rows from a table based on SQL conditions.
     *
     * ```ts
     * // In table store, keep only rows where the fruit is not an apple.
     * await sdb.filter("store", `"fruit" != 'apple'`)
     *
     * // More examples:
     * await sdb.filter("store", `"price" > 100 AND "quantity" > 0`)
     * await sdb.filter("inventory", `"category" = 'Electronics' OR "category" = 'Appliances'`)
     * await sdb.filter("customers", `"lastPurchaseDate" >= '2023-01-01'`)
     * ```
     *
     * @param table - The name of the table from which rows will be filtered.
     * @param conditions - The filtering conditions specified as a SQL WHERE clause.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */

    async filter(
        table: string,
        conditions: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nfilter()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE OR REPLACE TABLE ${table} AS SELECT *
            FROM ${table}
            WHERE ${conditions}`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Rounds numeric values in specified columns of a table.
     *
     * ```ts
     * // Round to the nearest integer.
     * await sdb.round("tableA", "column1")
     *
     * // Round with a specific number of decimals.
     * await sdb.round("tableA", "column1", {decimals: 2})
     *
     * // Round with a specific method. Other methods are "round" and "ceiling".
     * await sdb.round("tableA", "column1", {method: "floor"})
     *
     * ```
     *
     * @param table - The name of the table where numeric values will be rounded.
     * @param columns - Either a string or an array of strings specifying the columns containing numeric values to be rounded.
     * @param options - An optional object with configuration options:
     *   - decimals: The number of decimal places to round to. Defaults to 0.
     *   - method: The rounding method to use ("round", "ceiling", or "floor"). Defaults to "round".
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */

    async round(
        table: string,
        columns: string | string[],
        options: {
            decimals?: number
            method?: "round" | "ceiling" | "floor"
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nround()")
        return await queryDB(
            this.connection,
            this.runQuery,
            roundQuery(table, stringToArray(columns), options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Converts data types (JavaScript or SQL types) of specified columns in a table.
     *
     * ```ts
     * // Convert columns to string and number
     * await sdb.convert("tableA", {column1: "string", column2: "integer"})
     * // Same thing
     * await sdb.convert("tableA", {column1: "varchar", column2: "bigint"})
     * // Convert a string to a date
     * await sdb.convert("tableA", {column3: "datetime"}, {datetimeFormat: "%Y-%m-%d" })
     * ```
     *
     * @param table - The name of the table where data types will be converted.
     * @param types - An object mapping column names to the target data types for conversion.
     * @param options - An optional object with configuration options:
     *   - try: When true, the values that can't be converted will be replaced by NULL instead of throwing an error. Defaults to false.
     *   - datetimeFormat: A string specifying the format for date and time conversions. The method uses strftime and strptime functions from DuckDB. For the format specifiers, see https://duckdb.org/docs/sql/functions/dateformat.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async convert(
        table: string,
        types: {
            [key: string]:
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
        },
        options: {
            try?: boolean
            datetimeFormat?: string
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nconvert()")

        const allTypes = await this.getTypes(table)
        const allColumns = Object.keys(allTypes)

        return await queryDB(
            this.connection,
            this.runQuery,
            convertQuery(
                table,
                Object.keys(types),
                Object.values(types),
                allColumns,
                allTypes,
                options
            ),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Removes one or more tables from the database.
     *
     * ```ts
     * await sdb.removeTables(["table1", "table2"])
     * ```
     *
     * @param tables - The name or an array of names of the tables to be removed.
     * @param options - An optional object with configuration options:
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     */
    async removeTables(
        tables: string | string[],
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nremoveTables()")

        return await queryDB(
            this.connection,
            this.runQuery,
            stringToArray(tables)
                .map((d) => `DROP TABLE ${d};`)
                .join("\n"),
            mergeOptions(this, { ...options, table: null })
        )
    }

    /**
     * Removes one or more columns from a table.
     *
     * ```ts
     * await sdb.removeColumns("tableA", ["column1", "column2"])
     * ```
     *
     * @param table - The name of the table from which columns will be removed.
     * @param columns - The name or an array of names of the columns to be removed.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async removeColumns(
        table: string,
        columns: string | string[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nremoveColumns()")

        return await queryDB(
            this.connection,
            this.runQuery,
            stringToArray(columns)
                .map((d) => `ALTER TABLE ${table} DROP "${d}";`)
                .join("\n"),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Adds a new column to a table based on a type (JavaScript or SQL types) and a SQL definition.
     *
     * ```ts
     * await sdb.addColumn("tableA", "column3", "float", `"column1" + "column2"`)
     * ```
     *
     * @param table - The name of the table to which the new column will be added.
     * @param column - The name of the new column to be added.
     * @param type - The data type for the new column. JavaScript or SQL types.
     * @param definition - SQL expression defining how the values should be computed for the new column.
     * @param options - An optional object with configuration options:
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async addColumn(
        table: string,
        column: string,
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
            | "timestamp with time zone",
        definition: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\naddColumn()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `ALTER TABLE ${table} ADD "${column}" ${parseType(type)};
            UPDATE ${table} SET "${column}" = ${definition}`,
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Sorts the rows of a table based on specified column(s) and order(s).
     * ```ts
     * // Sort column1 ascendingly then column2 descendingly.
     * await sdb.sort("tableA", {column1: "asc", column2: "desc"})
     * // Same thing but taking French accent into account.
     * await sdb.sort("tableA", {column1: "asc", column2: "desc"}, {lang: {column1: "fr"}})
     * ```
     * @param table - The name of the table to sort.
     * @param order - An object mapping column names to the sorting order: "asc" for ascending or "desc" for descending.
     * @param options - An optional object with configuration options:
     *   - lang: An object mapping column names to language codes. See DuckDB Collations documentation for more: https://duckdb.org/docs/sql/expressions/collations.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async sort(
        table: string,
        order: { [key: string]: "asc" | "desc" },
        options: {
            lang?: { [key: string]: string }
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nsort()")
        return await queryDB(
            this.connection,
            this.runQuery,
            sortQuery(table, order, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Assigns ranks in a new column based on specified column values within a table.
     *
     * ```ts
     * // Computing ranks in the new column rank from the column1 values.
     * await sdb.ranks("tableA", "column1", "rank")
     *
     * * // Computing ranks in the new column rank from the column1 values. Using the values from column2 as categories.
     * await sdb.ranks("tableA", "column1", "rank", {categories: "column2"})
     * ```
     *
     * @param table - The name of the table.
     * @param values - The column containing values to be used for ranking.
     * @param newColumn - The name of the new column where the ranks will be stored.
     * @param options - An optional object with configuration options:
     *   - categories: The column or columns that define categories for ranking.
     *   - noGaps: A boolean indicating whether to assign ranks without gaps. Defaults to false.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async ranks(
        table: string,
        values: string,
        newColumn: string,
        options: {
            categories?: string | string[]
            noGaps?: boolean
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nranks()")
        return await queryDB(
            this.connection,
            this.runQuery,
            ranksQuery(table, values, newColumn, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Assigns quantiles for specified column values within a table.
     *
     * ```ts
     * // Assigning a quantile from 1 to 10 for each row in new column quantiles, based on values from column1.
     * await sdb.quantiles("tableA", "column1", 10, "quantiles")
     * // Same thing, except the values in column2 are used as categories.
     * await sdb.quantiles("tableA", "column1", 10, "quantiles", {categories: "column2"})
     * ```
     *
     * @param table - The name of the table.
     * @param values - The column containing values from which quantiles will be assigned.
     * @param nbQuantiles - The number of quantiles.
     * @param newColumn - The name of the new column where the assigned quantiles will be stored.
     * @param options - An optional object with configuration options:
     *   - categories: The column or columns that define categories for computing quantiles. This can be a single column name or an array of column names.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async quantiles(
        table: string,
        values: string,
        nbQuantiles: number,
        newColumn: string,
        options: {
            categories?: string | string[]
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nquantiles()")
        return await queryDB(
            this.connection,
            this.runQuery,
            quantilesQuery(table, values, nbQuantiles, newColumn, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Assigns bins for specified column values within a table, based on a interval size.
     *
     * ```ts
     * // Assigning a bin for each row in new column bins based on column1 values, with an interval of 10.
     * await sdb.bins("tableA", "column1", 10, "bins")
     * // If the minimum value in column1 is 5, the bins will follow this pattern: "[5-14]", "[15-24]", "[25-34]", etc.
     *
     * // Same thing, but with the bins starting at a specific value.
     * await sdb.bins("tableA", "column1", 10, "bins", {startValue: 0})
     * // The bins will follow this pattern: "[0-9]", "[10-19]", "[20-29]", etc.
     * ```
     *
     * @param table - The name of the table for which bins will be computed.
     * @param values - The column containing values from which bins will be computed.
     * @param interval - The interval size for binning the values.
     * @param newColumn - The name of the new column where the bins will be stored.
     * @param options - An optional object with configuration options:
     *   - startValue: The starting value for binning. Defaults to the minimum value in the specified column.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async bins(
        table: string,
        values: string,
        interval: number,
        newColumn: string,
        options: {
            startValue?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nbins()")
        return await queryDB(
            this.connection,
            this.runQuery,
            await binsQuery(this, table, values, interval, newColumn, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Computes proportions within a row for specified columns in a given table.
     *
     * For example, let's say this is tableA.
     *
     * | Year | Men | Women | NonBinary |
     * | ---- | --- | ----- | ----------|
     * |2021  | 564 | 685   | 145       |
     * |2022  | 354 | 278   | 56        |
     * |2023  | 856 | 321   | 221       |
     *
     * We compute the proportions of men, women, and non-binary on each row.
     * ```ts
     * await sdb.proportionsHorizontal("tableA", ["Men", "Women", "NonBinary"])
     * ```
     *
     * The table now looks like this.
     *
     * | Year | Men | Women | NonBinary | MenPerc | WomenPerc | NonBinaryPerc |
     * | ---- | --- | ----- | --------- | ------- | --------- | ------------- |
     * |2021  | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
     * |2022  | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
     * |2023  | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |
     *
     * By default, the new columns have the suffix "Perc", but you use something else if you want.
     * ```ts
     * await sdb.proportionsHorizontal("tableA", ["Men", "Women", "NonBinary"], {suffix: "Prop"})
     * ```
     *
     * Here's the result with a different suffix.
     *
     * | Year | Men | Women | NonBinary | MenProp | WomenProp | NonBinaryProp |
     * | ---- | --- | ----- | --------- | ------- | --------- | ------------- |
     * |2021  | 564 | 685   | 145       | 0.4     | 0.49      | 0.10          |
     * |2022  | 354 | 278   | 56        | 0.51    | 0.4       | 0.08          |
     * |2023  | 856 | 321   | 221       | 0.61    | 0.23      | 0.16          |
     *
     * @param table - The name of the table.
     * @param columns - The columns for which proportions will be computed on each row.
     * @param options - An optional object with configuration options:
     *   - suffix: A string suffix to append to the names of the new columns storing the computed proportions. Defaults to "Perc".
     *   - decimals: The number of decimal places to round the computed proportions. Defaults to 2.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async proportionsHorizontal(
        table: string,
        columns: string[],
        options: {
            suffix?: string
            decimals?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) &&
            console.log("\nproportionsHorizontal()")
        return await queryDB(
            this.connection,
            this.runQuery,
            proportionsHorizontalQuery(table, columns, options),
            mergeOptions(this, { ...options, table })
        )
    }

    /**
     * Computes proportions over a column values within a table.
     *
     * ```ts
     * // This will add a column column1Perc with the result of each column1 value divided by the sum of all column1 values.
     * await sdb.proportionsVertical("tableA", "column1")
     *
     * // Same thing, but with the suffix Prop instead of Perc. The new column with the proportions will be column1Prop. Also, the proportions will have 4 decimals instead of 2 (default).
     * await sdb.proportionsVertical("tableA", "column1", {suffix: "Prop", decimals: 4})
     * ```
     *
     * @param table - The name of the table.
     * @param column - The column containing values for which proportions will be computed. The proportions are calculated based on the sum of values in the specified column.
     * @param options - An optional object with configuration options:
     *   - categories: The column or columns that define categories for computing proportions. This can be a single column name or an array of column names.
     *   - suffix: A string suffix to append to the names of the new columns storing the computed proportions. Defaults to "Perc".
     *   - decimals: The number of decimal places to round the computed proportions. Defaults to 2.
     *   - returnDataFrom: Specifies whether to return data from the "query", "table", or "none". Defaults to "none".
     *   - debug: A boolean indicating whether debugging information should be logged. Defaults to the value set in the SimpleDB instance.
     *   - nbRowsToLog: The number of rows to log when debugging. Defaults to the value set in the SimpleDB instance.
     */
    async proportionsVertical(
        table: string,
        column: string,
        options: {
            categories?: string | string[]
            suffix?: string
            decimals?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nproportionsVertical()")
        return await queryDB(
            this.connection,
            this.runQuery,
            proportionsVerticalQuery(table, column, options),
            mergeOptions(this, { ...options, table })
        )
    }

    async join(
        leftTable: string,
        rightTable: string,
        commonColumn: string,
        outputTable: string,
        join: "inner" | "left" | "right" | "full",
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\njoin()")

        return await queryDB(
            this.connection,
            this.runQuery,
            joinQuery(leftTable, rightTable, commonColumn, outputTable, join),
            mergeOptions(this, {
                ...options,
                table: outputTable,
            })
        )
    }

    async summarize(
        table: string,
        outputTable: string,
        options: {
            values?: string | string[]
            categories?: string | string[]
            summaries?:
                | (
                      | "count"
                      | "min"
                      | "max"
                      | "avg"
                      | "median"
                      | "sum"
                      | "skew"
                      | "stdDev"
                      | "var"
                  )
                | (
                      | "count"
                      | "min"
                      | "max"
                      | "avg"
                      | "median"
                      | "sum"
                      | "skew"
                      | "stdDev"
                      | "var"
                  )[]
            decimals?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await summarize(this, table, outputTable, options)
    }

    async correlations(
        table: string,
        outputTable: string,
        options: {
            x?: string
            y?: string
            decimals?: number
            order?: "asc" | "desc"
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await correlations(this, table, outputTable, options)
    }

    async linearRegressions(
        table: string,
        outputTable: string,
        options: {
            x?: string
            y?: string
            decimals?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await linearRegressions(this, table, outputTable, options)
    }

    async outliersIQR(
        table: string,
        column: string,
        options: {
            newColumn?: string
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\noutliersIQR()")
        options.newColumn = options.newColumn ?? "outliers"
        return await queryDB(
            this.connection,
            this.runQuery,
            outliersIQRQuery(
                table,
                column,
                (await this.getLength(table)) % 2 === 0 ? "even" : "odd",
                options
            ),
            mergeOptions(this, { ...options, table })
        )
    }

    async zScore(
        table: string,
        column: string,
        options: {
            newColumn?: string
            decimals?: number
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nzScore()")
        options.newColumn = options.newColumn ?? "zScore"
        options.decimals = options.decimals ?? 2
        return await queryDB(
            this.connection,
            this.runQuery,
            zScoreQuery(table, column, options),
            mergeOptions(this, { ...options, table })
        )
    }

    async customQuery(
        query: string,
        options: {
            returnDataFrom?: "query" | "table" | "none"
            table?: string
            returnedDataModifier?: (
                rows: {
                    [key: string]: number | string | Date | boolean | null
                }[]
            ) => {
                [key: string]: number | string | Date | boolean | null
            }[]
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ncustomQuery()")
        return await queryDB(
            this.connection,
            this.runQuery,
            query,
            mergeOptions(this, { ...options, table: options.table ?? null })
        )
    }

    async updateWithJS(
        table: string,
        dataModifier: (
            rows: {
                [key: string]: number | string | Date | boolean | null
            }[]
        ) => {
            [key: string]: number | string | Date | boolean | null
        }[],
        options: {
            returnDataFrom?: "query" | "table" | "none"
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nupdateWithJS()")
        const oldData = await this.getData(
            table,
            mergeOptions(this, { ...options, table })
        )
        if (!oldData) {
            throw new Error("No data from getData.")
        }
        const newData = dataModifier(oldData)
        const updatedData = await queryDB(
            this.connection,
            this.runQuery,
            loadArrayQuery(table, newData, { replace: true }),
            mergeOptions(this, { ...options, table })
        )

        return updatedData
    }

    async createTable(
        table: string,
        types: {
            [key: string]:
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
        },
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ncreateTable()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `CREATE TABLE ${table} (${Object.keys(types)
                .map((d) => `"${d}" ${parseType(types[d])}`)
                .join(", ")});`,
            mergeOptions(this, { ...options, table })
        )
    }

    async getSchema(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetSchema()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `DESCRIBE ${table}`,
            mergeOptions(this, {
                ...options,
                returnDataFrom: "query",
                nbRowsToLog: Infinity,
                table,
            })
        )
    }

    async getDescription(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getDescription(this, table, options)
    }

    async hasTable(table: string, options: { debug?: boolean } = {}) {
        ;(options.debug || this.debug) && console.log("\nhasTable()")
        return (await this.getTables(options)).includes(table)
    }

    async getTables(
        options: {
            debug?: boolean
        } = {}
    ) {
        return getTables(this, options)
    }

    async getColumns(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getColumns(this, table, options)
    }

    async getWidth(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetWidth()")
        return (await getColumns(this, table, options)).length
    }

    async getLength(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getLength(this, table, options)
    }

    async dataPoints(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ndataPoints()")
        return (
            (await this.getWidth(table, options)) *
            (await this.getLength(table, options))
        )
    }

    async getTypes(
        table: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getTypes(this, table, options)
    }

    async getValues(
        table: string,
        column: string,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await getValues(this, table, column, options)
    }

    async getMin(
        table: string,
        column: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getMin(this, table, column, options)
    }

    async getMax(
        table: string,
        column: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getMax(this, table, column, options)
    }

    async getMean(
        table: string,
        column: string,
        options: {
            decimals?: number
            debug?: boolean
        } = {}
    ) {
        return await getMean(this, table, column, options)
    }

    async getMedian(
        table: string,
        column: string,
        options: {
            decimals?: number
            debug?: boolean
        } = {}
    ) {
        return await getMedian(this, table, column, options)
    }

    async getSum(
        table: string,
        column: string,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getSum(this, table, column, options)
    }

    async getSkew(
        table: string,
        column: string,
        options: {
            decimals?: number
            debug?: boolean
        } = {}
    ) {
        return await getSkew(this, table, column, options)
    }

    async getStdDev(
        table: string,
        column: string,
        options: {
            decimals?: number
            debug?: boolean
        } = {}
    ) {
        return await getStdDev(this, table, column, options)
    }

    async getVar(
        table: string,
        column: string,
        options: {
            decimals?: number
            debug?: boolean
        } = {}
    ) {
        return await getVar(this, table, column, options)
    }

    async getQuantile(
        table: string,
        column: string,
        quantile: number,
        options: { decimals?: number; debug?: boolean } = {}
    ) {
        return await getQuantile(this, table, column, quantile, options)
    }

    async getUniques(
        table: string,
        column: string,
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        return await getUniques(this, table, column, options)
    }

    async getFirstRow(
        table: string,
        options: {
            condition?: string
            debug?: boolean
        } = {}
    ) {
        return getFirstRow(this, table, options)
    }

    async getLastRow(
        table: string,
        options: {
            condition?: string
            debug?: boolean
        } = {}
    ) {
        return getLastRow(this, table, options)
    }

    async getTop(
        table: string,
        count: number,
        options: {
            debug?: boolean
        } = {}
    ) {
        return await getTop(this, table, count, options)
    }

    async getBottom(
        table: string,
        count: number,
        options: {
            originalOrder?: boolean
            debug?: boolean
        } = {}
    ) {
        return await getBottom(this, table, count, options)
    }

    async getData(
        table: string,
        options: {
            condition?: string
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetData()")
        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * from ${table}${
                options.condition ? ` WHERE ${options.condition}` : ""
            }`,
            mergeOptions(this, { ...options, returnDataFrom: "query", table })
        )
    }

    async getChartData(
        table: string,
        options: {
            condition?: string
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ngetChartData()")
        return (await this.getData(table, options)) as Data
    }

    async logTable(
        table: string,
        options: {
            nbRowsToLog?: number
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\nlogTable()")
        options.debug = options.debug ?? true
        options.nbRowsToLog = options.nbRowsToLog ?? this.nbRowsToLog
        return await queryDB(
            this.connection,
            this.runQuery,
            `SELECT * FROM ${table} LIMIT ${options.nbRowsToLog}`,
            mergeOptions(this, { ...options, table })
        )
    }

    async done(
        options: {
            debug?: boolean
        } = {}
    ) {
        ;(options.debug || this.debug) && console.log("\ndone()")
        await (this.connection as AsyncDuckDBConnection)?.close()
        await (this.db as AsyncDuckDB)?.terminate()
        this.worker?.terminate()
    }
}
