import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("linearRegressions", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
        await simpleNodeDB.loadData(
            "someData",
            "test/data/files/dataCorrelations.json"
        )
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the slope, intercept and coefficient of determination for all permutations of numerical columns", async () => {
        const data = await simpleNodeDB.linearRegressions(
            "someData",
            "linearRegressions",
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { x: "key3", y: "key4", slope: -0.58, intercept: 9.08, r2: 0.51 },
            { x: "key4", y: "key3", slope: -0.88, intercept: 11.61, r2: 0.51 },
            { x: "key2", y: "key3", slope: 0.17, intercept: 5.89, r2: 0.13 },
            { x: "key3", y: "key2", slope: 0.73, intercept: 3.59, r2: 0.13 },
            { x: "key2", y: "key4", slope: -0.1, intercept: 5.63, r2: 0.06 },
            { x: "key4", y: "key2", slope: -0.63, intercept: 11.97, r2: 0.06 },
        ])
    })

    it("should return the slope, intercept and coefficient of determination for all combination of a column x and other numerical columns", async () => {
        const data = await simpleNodeDB.linearRegressions(
            "someData",
            "linearRegressions",
            {
                x: "key2",
                returnDataFrom: "table",
            }
        )
        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", slope: 0.17, intercept: 5.89, r2: 0.13 },
            { x: "key2", y: "key4", slope: -0.1, intercept: 5.63, r2: 0.06 },
        ])
    })
    it("should return the slope, intercept and coefficient of determination for two specific columns", async () => {
        const data = await simpleNodeDB.linearRegressions(
            "someData",
            "linearRegressions",
            {
                x: "key2",
                y: "key3",
                returnDataFrom: "table",
            }
        )
        assert.deepStrictEqual(data, [
            { x: "key2", y: "key3", slope: 0.17, intercept: 5.89, r2: 0.13 },
        ])
    })
    it("should return the slope, intercept and coefficient of determination for two specific columns, with a specific number of decimals", async () => {
        const data = await simpleNodeDB.linearRegressions(
            "someData",
            "linearRegressions",
            {
                x: "key2",
                y: "key3",
                decimals: 5,
                returnDataFrom: "table",
            }
        )
        assert.deepStrictEqual(data, [
            {
                x: "key2",
                y: "key3",
                slope: 0.17201,
                intercept: 5.89045,
                r2: 0.12512,
            },
        ])
    })
})