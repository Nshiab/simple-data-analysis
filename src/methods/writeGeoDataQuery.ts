import getExtension from "../helpers/getExtension.js"

export default function writeGeoDataQuery(
    table: string,
    file: string,
    options: { precision?: number } = {}
) {
    const fileExtension = getExtension(file)
    if (fileExtension === "geojson") {
        const layerOptions = []
        if (typeof options.precision === "number") {
            layerOptions.push(`COORDINATE_PRECISION=${options.precision}`)
        }
        layerOptions.push(`RFC7946=YES`)

        return `COPY ${table} to '${file}' WITH (FORMAT GDAL, DRIVER 'GeoJSON'${layerOptions.length > 0 ? `, LAYER_CREATION_OPTIONS ('WRITE_NAME=NO', ${layerOptions.map((d) => `'${d}'`).join(", ")})` : ""})`
    } else {
        throw new Error(`Unknown extension ${fileExtension}`)
    }
}
