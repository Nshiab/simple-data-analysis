import getDuckDB from "../helpers/getDuckDB.js"
import mergeOptions from "../helpers/mergeOptions.js"
import queryDB from "../helpers/queryDB.js"
import joinGeo from "../methods/joinGeo.js"
import SimpleDB from "./SimpleDB.js"

/**
 * SimpleGeoDB extends the SimpleDB class by adding methods for geospatial analysis. This class provides a simplified interface for working with DuckDB, a high-performance in-memory analytical database. This class is meant to be used in a web browser. For NodeJS and similar runtimes, use SimpleNodeDB with the spatial option set to true.
 *
 * Here's how to instantiate a SimpleGeoDB instance.
 *
 * ```ts
 * const sdb = new SimpleGeoDB()
 *
 * // Same thing but will log useful information in the console. The first 20 rows of tables will be logged.
 * const sdb = new SimpleDB({ debug: true, nbRowsToLog: 20})
 * ```
 *
 * The start() method will be called internally automatically with the first method you'll run. It initializes DuckDB and establishes a connection to the database. It loads the [spatial](https://duckdb.org/docs/extensions/spatial) extension.
 *
 */
export default class SimpleGeoDB extends SimpleDB {
    constructor(
        options: {
            debug?: boolean
            nbRowsToLog?: number
        } = {}
    ) {
        super(options)
        this.spatial = true
    }

    /**
     * Initializes DuckDB and establishes a connection to the database. It installs and loads the [spatial](https://duckdb.org/docs/extensions/spatial) extension. It's called automatically with the first method you'll run.
     */
    async start() {
        this.debug && console.log("\nstart()\n")
        const duckDB = await getDuckDB()
        this.db = duckDB.db
        this.connection = await this.db.connect()
        this.connection.query("INSTALL spatial; LOAD spatial;")
        this.worker = duckDB.worker
    }

    /**
     * Creates or replaces a table and loads geospatial data from an external file into it.
     *
     * ```ts
     * // With a URL
     * await sdb.loadGeoData("tableGeo", "https://some-website.com/some-data.geojson")
     *
     * // With a local file
     * await sdb.loadGeoData("tableGeo", "./some-data.geojson")
     * ```
     *
     * @param table - The name of the new table.
     * @param file - The URL or path to the external file containing the geospatial data.
     *
     * @category Geospatial
     */
    async loadGeoData(table: string, file: string) {
        if (this.spatial === false) {
            // Just for SimpleNodeDB
            throw new Error(
                "You must instanciate with spatial set to true => new SimpleNodeDB({spatial: true})"
            )
        }

        await queryDB(
            this,
            `CREATE OR REPLACE TABLE ${table} AS SELECT * FROM ST_Read('${file}');`,
            mergeOptions(this, {
                table,
                method: "loadGeoData()",
                parameters: { table, file },
            })
        )
    }

    /**
     * Checks if a geometry is valid.
     *
     * ```ts
     * // Checks if the geometries in column geom from table tableGeo are valid and returns a boolean in column isValid.
     * await sdb.isValidGeo("tableGeo", "geom", "isValid")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the results.
     *
     * @category Geospatial
     */
    async isValidGeo(table: string, column: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD COLUMN "${newColumn}" BOOLEAN; UPDATE ${table} SET "${newColumn}" = ST_IsValid("${column}")`,
            mergeOptions(this, {
                table,
                method: "isValidGeo()",
                parameters: { table, column },
            })
        )
    }

    /**
     * Flips the coordinates of a geometry. Useful for some geojson files which have lat and lon inverted.
     *
     * ```ts
     * await sdb.flipCoordinates("tableGeo", "geom")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     *
     * @category Geospatial
     */
    async flipCoordinates(table: string, column: string) {
        await queryDB(
            this,
            `UPDATE ${table} SET "${column}" = ST_FlipCoordinates("${column}")`,
            mergeOptions(this, {
                table,
                method: "flipCoordinates()",
                parameters: { table, column },
            })
        )
    }

    /**
     * Reprojects the data from one Spatial Reference System (SRS) to another.
     *
     * ```ts
     * // From EPSG:3347 (also called NAD83/Statistics Canada Lambert with coordinates in meters) to EPSG:4326 (also called WGS84, with lat and lon in degrees)
     * await sdb.reproject("tableGeo", "geom", "EPSG:3347", "EPSG:4326")
     * ```
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param from - The original SRS.
     * @param to - The target SRS.
     * @category Geospatial
     */
    async reproject(table: string, column: string, from: string, to: string) {
        await queryDB(
            this,
            `UPDATE ${table} SET "${column}" = ST_Transform("${column}", '${from}', '${to}')`,
            mergeOptions(this, {
                table,
                method: "reproject()",
                parameters: { table, column, from, to },
            })
        )
    }

    /**
     * Computes the area of geometries. The values are returned in the SRS unit.
     *
     * ```ts
     * // Computes the area of the geometries in the column geom from the table tableGeo, and returns the results in the column area.
     * await sdb.area("tableGeo", "geom", "area")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the computed areas.
     *
     * @category Geospatial
     */
    async area(table: string, column: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" DOUBLE; UPDATE ${table} SET "${newColumn}" =  ST_Area("${column}");`,
            mergeOptions(this, {
                table,
                method: "area()",
                parameters: { table, column, newColumn },
            })
        )
    }

    /**
     * Merges the data of two tables based on a spatial join. With SimpleNodeDB, it might create a .tmp folder, so make sure to add .tmp to your gitignore.
     *
     * ```ts
     * // Merges data of tableA and tableB based on geometries that intersect in tableA and tableB. By default, the method looks for columns named 'geom' storing the geometries in the tables, does a left join and overwrites leftTable (tableA) with the results. The method also appends the name of the table to the 'geom' columns in the returned data.
     * await sdb.joinGeo("tableA", "intersect", "tableB",)
     *
     * // Same thing but with specific column names storing geometries, a specific join type, and returning the results in a new table.
     * await sdb.joinGeo("tableA", "intersect", "tableB", {geoColumnLeft: "geometriesA", geoColumnRight: "geometriesB", type: "inner", outputTable: "tableC"})
     *
     * // Merges data based on geometries in table A that are inside geometries in table B. The table order is important.
     * await sdb.joinGeo("tableA", "inside", "tableB")
     * ```
     * @param leftTable - The name of the left table to be joined.
     * @param method - The method for the spatial join.
     * @param rightTable - The name of the right table to be joined.
     * @param options - An optional object with configuration options:
     *   @param options.columnLeftTable - The column storing the geometries in leftTable. It's 'geom' by default.
     *   @param options.columnRightTable - The column storing the geometries in rightTable. It's 'geom' by default.
     *   @param options.type - The type of join operation to perform. For some methods (like 'inside'), the table order is important.
     *   @param options.outputTable - The name of the new table that will store the result of the join operation. Default is the leftTable.
     *
     * @category Geospatial
     */
    async joinGeo(
        leftTable: string,
        method: "intersect" | "inside",
        rightTable: string,
        options: {
            columnLeftTable?: string
            columnRightTable?: string
            type?: "inner" | "left" | "right" | "full"
            outputTable?: string
        } = {}
    ) {
        await joinGeo(this, leftTable, method, rightTable, options)
    }

    /**
     * Computes the intersection of geometries.
     *
     * ```ts
     * // Computes the intersection of geometries in geomA and geomB columns from table tableGeo and puts the new geometries in column inter.
     * await sdb.intersection("tableGeo", ["geomA", "geomB"], "inter")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param columns - The names of the two columns storing the geometries.
     * @param newColumn - The name of the new column storing the computed intersections.
     *
     * @category Geospatial
     */
    async intersection(
        table: string,
        columns: [string, string],
        newColumn: string
    ) {
        if (columns.length !== 2) {
            throw new Error(
                `The columns parameters must be an array with two strings. For example: ["geomA", "geomB"].`
            )
        }
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" GEOMETRY; UPDATE ${table} SET "${newColumn}" = ST_Intersection("${columns[0]}", "${columns[1]}")`,
            mergeOptions(this, {
                table,
                method: "intersection()",
                parameters: { table, columns, newColumn },
            })
        )
    }

    /**
     * Removes the intersection of two geometries.
     *
     * ```ts
     * // Removes the intersection of geomA and geomB from geomA and returns the results in the new column noIntersection.
     * await sdb.removeIntersection("tableGeo", ["geomA", "geomB"], "noIntersection")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param columns - The names of the two columns storing the geometries. The order is important.
     * @param newColumn - The name of the new column storing the new geometries.
     *
     * @category Geospatial
     */
    async removeIntersection(
        table: string,
        columns: [string, string],
        newColumn: string
    ) {
        if (columns.length !== 2) {
            throw new Error(
                `The columns parameters must be an array with two strings. For example: ["geomA", "geomB"].`
            )
        }
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" GEOMETRY; UPDATE ${table} SET "${newColumn}" = ST_Difference("${columns[0]}", "${columns[1]}")`,
            mergeOptions(this, {
                table,
                method: "removeIntersection()",
                parameters: { table, columns, newColumn },
            })
        )
    }

    /**
     * Returns true if two geometries intersect.
     *
     * ```ts
     * // Checks if geometries in geomA and in geomB intersect and return true or false in new column inter.
     * await sdb.intersect("tableGeo", ["geomA", "geomB"], "inter")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param columns - The names of the two columns storing the geometries.
     * @param newColumn - The name of the new column with true or false values.
     *
     * @category Geospatial
     */
    async intersect(
        table: string,
        columns: [string, string],
        newColumn: string
    ) {
        if (columns.length !== 2) {
            throw new Error(
                `The columns parameters must be an array with two strings. For example: ["geomA", "geomB"].`
            )
        }
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" BOOLEAN; UPDATE ${table} SET "${newColumn}" = ST_Intersects("${columns[0]}", "${columns[1]}")`,
            mergeOptions(this, {
                table,
                method: "intersect()",
                parameters: { table, columns, newColumn },
            })
        )
    }

    /**
     * Returns true if all points of a geometry lies inside another geometry.
     *
     * ```ts
     * // Checks if geometries in column geomA are inside geometries in column geomB and return true or false in new column isInside.
     * await sdb.inside("tableGeo", ["geomA", "geomB"], "isInside")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param columns - The names of the two columns storing the geometries. The first column holds the geometries that will be tested for containment. The second column stores the geometries to be tested as containers.
     * @param newColumn - The name of the new column with true or false values.
     *
     * @category Geospatial
     */
    async inside(table: string, columns: [string, string], newColumn: string) {
        if (columns.length !== 2) {
            throw new Error(
                `The columns parameters must be an array with two strings. For example: ["geomA", "geomB"].`
            )
        }
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" BOOLEAN; UPDATE ${table} SET "${newColumn}" = ST_Covers("${columns[1]}", "${columns[0]}")`,
            mergeOptions(this, {
                table,
                method: "inside()",
                parameters: { table, columns, newColumn },
            })
        )
    }

    /**
     * Extracts the latitude and longitude of points.
     *
     * ```ts
     * // Extracts the latitude and longitude of points from the points in the "geom" column from "tableGeo" and put them in the columns "lat" and "lon"
     * await sdb.latLon("tableGeo", "geom", ["lat", "lon"])
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the table storing the points.
     * @param newColumns - The names the columns storing the latitude and the longitude, in this order.
     *
     * @category Geospatial
     */
    async latLon(table: string, column: string, newColumns: [string, string]) {
        if (newColumns.length !== 2) {
            throw new Error(
                `The newColumns parameters must be an array with two strings. For example: ["lat", "lon"].`
            )
        }
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumns[0]}" DOUBLE; UPDATE ${table} SET "${newColumns[0]}" = ST_Y("${column}");
             ALTER TABLE ${table} ADD "${newColumns[1]}" DOUBLE; UPDATE ${table} SET "${newColumns[1]}" = ST_X("${column}");`,
            mergeOptions(this, {
                table,
                method: "inside()",
                parameters: { table, column, newColumns },
            })
        )
    }

    /**
     * Simplifies the geometries while preserving their topology. The simplification occurs on an object-by-object basis.
     *
     * ```ts
     * // Simplifies with a tolerance of 0.1.
     * await sdb.simplify("tableGeo", "geomA", 0.1)
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param tolerance - A number used for the simplification. A higher tolerance results in a more significant simplification.
     *
     * @category Geospatial
     */
    async simplify(table: string, column: string, tolerance: number) {
        await queryDB(
            this,
            `UPDATE ${table} SET "${column}" = ST_SimplifyPreserveTopology("${column}", ${tolerance})`,
            mergeOptions(this, {
                table,
                method: "simplify()",
                parameters: { table, column, tolerance },
            })
        )
    }

    /**
     * Computes the centroid of geometries. The values are returned in the SRS unit.
     *
     * ```ts
     * // Computes the centroid of the geometries in the column geom from the table tableGeo, and returns the results in the column centroid.
     * await sdb.centroid("tableGeo", "geom", "centroid")
     * ```
     *
     * @param table - The name of the table storing the geospatial data.
     * @param column - The name of the column storing the geometries.
     * @param newColumn - The name of the new column storing the centroids.
     *
     * @category Geospatial
     */
    async centroid(table: string, column: string, newColumn: string) {
        await queryDB(
            this,
            `ALTER TABLE ${table} ADD "${newColumn}" GEOMETRY; UPDATE ${table} SET "${newColumn}" =  ST_Centroid("${column}");`,
            mergeOptions(this, {
                table,
                method: "centroid()",
                parameters: { table, column, newColumn },
            })
        )
    }
}
