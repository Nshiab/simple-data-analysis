import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("summarize", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should summarize all numerical columns in a table", async () => {
        await simpleNodeDB.loadData(
            "dataSummarizeAll",
            "test/data/files/dataSummarize.json"
        )

        const data = await simpleNodeDB.summarize("dataSummarizeAll", {
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 4,
                min: 1,
                max: 22,
                avg: 9,
                median: 6.5,
                sum: 36,
                skew: 0.97,
                stdDev: 9.76,
                var: 95.33,
            },
            {
                value: "key3",
                count: 4,
                min: 2.35,
                max: 12.34,
                avg: 7.44,
                median: 7.53,
                sum: 29.75,
                skew: -0.06,
                stdDev: 4.75,
                var: 22.54,
            },
        ])
    })
    it("should summarize specific numerical columns in a table", async () => {
        await simpleNodeDB.loadData(
            "dataSummarizeOneValue",
            "test/data/files/dataSummarize.json"
        )

        const data = await simpleNodeDB.summarize("dataSummarizeOneValue", {
            values: "key2",
            returnDataFrom: "table",
        })

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 4,
                min: 1,
                max: 22,
                avg: 9,
                median: 6.5,
                sum: 36,
                skew: 0.97,
                stdDev: 9.76,
                var: 95.33,
            },
        ])
    })
    it("should summarize specific numerical columns in a table with a specific number of decimals", async () => {
        await simpleNodeDB.loadData(
            "dataSummarizeOneValueDecimals",
            "test/data/files/dataSummarize.json"
        )

        const data = await simpleNodeDB.summarize(
            "dataSummarizeOneValueDecimals",
            {
                values: "key2",
                decimals: 4,
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                count: 4,
                min: 1,
                max: 22,
                avg: 9,
                median: 6.5,
                sum: 36,
                skew: 0.9669,
                stdDev: 9.7639,
                var: 95.3333,
            },
        ])
    })
    it("should summarize all numerical columns in a table with a non numerical category", async () => {
        await simpleNodeDB.loadData(
            "dataSummarizeNonNumericalCategory",
            "test/data/files/dataSummarize.json"
        )

        const data = await simpleNodeDB.summarize(
            "dataSummarizeNonNumericalCategory",
            {
                categories: "key1",
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            {
                value: "key2",
                key1: "Fraise",
                count: 2,
                min: 11,
                max: 22,
                avg: 16.5,
                median: 16.5,
                sum: 33,
                skew: null,
                stdDev: 7.78,
                var: 60.5,
            },
            {
                value: "key2",
                key1: "Rubarbe",
                count: 2,
                min: 1,
                max: 2,
                avg: 1.5,
                median: 1.5,
                sum: 3,
                skew: null,
                stdDev: 0.71,
                var: 0.5,
            },
            {
                value: "key3",
                key1: "Fraise",
                count: 2,
                min: 2.35,
                max: 12.34,
                avg: 7.34,
                median: 7.34,
                sum: 14.69,
                skew: null,
                stdDev: 7.07,
                var: 49.98,
            },
            {
                value: "key3",
                key1: "Rubarbe",
                count: 2,
                min: 4.57,
                max: 10.5,
                avg: 7.53,
                median: 7.53,
                sum: 15.07,
                skew: null,
                stdDev: 4.2,
                var: 17.61,
            },
        ])
    })
    it("should summarize all numerical columns in a table with a numerical category", async () => {
        await simpleNodeDB.loadData(
            "dataSummarizeNumericalCategory",
            "test/data/files/dataSummarize.json"
        )

        const data = await simpleNodeDB.summarize(
            "dataSummarizeNumericalCategory",
            {
                categories: "key2",
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            {
                value: "key3",
                key2: 1,
                count: 1,
                min: 10.5,
                max: 10.5,
                avg: 10.5,
                median: 10.5,
                sum: 10.5,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key3",
                key2: 2,
                count: 1,
                min: 4.57,
                max: 4.57,
                avg: 4.57,
                median: 4.57,
                sum: 4.57,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key3",
                key2: 11,
                count: 1,
                min: 2.35,
                max: 2.35,
                avg: 2.35,
                median: 2.35,
                sum: 2.35,
                skew: null,
                stdDev: null,
                var: null,
            },
            {
                value: "key3",
                key2: 22,
                count: 1,
                min: 12.34,
                max: 12.34,
                avg: 12.34,
                median: 12.34,
                sum: 12.34,
                skew: null,
                stdDev: null,
                var: null,
            },
        ])
    })
    it("should summarize all numerical columns in a table with specific summaries", async () => {
        await simpleNodeDB.loadData(
            "dataSummarizeAllSpecificSummaries",
            "test/data/files/dataSummarize.json"
        )

        const data = await simpleNodeDB.summarize(
            "dataSummarizeAllSpecificSummaries",
            {
                summaries: ["avg", "count"],
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { value: "key2", avg: 9, count: 4 },
            { value: "key3", avg: 7.44, count: 4 },
        ])
    })
    it("should summarize all numerical columns in a table with specific summaries and specific categories", async () => {
        await simpleNodeDB.loadData(
            "dataSummarizeAllSpecificSummariesAndCategories",
            "test/data/files/dataSummarize.json"
        )

        const data = await simpleNodeDB.summarize(
            "dataSummarizeAllSpecificSummariesAndCategories",
            {
                categories: "key1",
                summaries: ["avg", "count"],
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, [
            { value: "key2", key1: "Fraise", avg: 16.5, count: 2 },
            { value: "key2", key1: "Rubarbe", avg: 1.5, count: 2 },
            { value: "key3", key1: "Fraise", avg: 7.34, count: 2 },
            { value: "key3", key1: "Rubarbe", avg: 7.53, count: 2 },
        ])
    })
    it("should summarize specific columns in a table with specific summaries and specific categories", async () => {
        await simpleNodeDB.loadData(
            "dataSummarizeAllSpecificValuesSummariesAndCategories",
            "test/data/files/dataSummarize.json"
        )

        const data = await simpleNodeDB.summarize(
            "dataSummarizeAllSpecificValuesSummariesAndCategories",
            {
                values: "key2",
                categories: "key1",
                summaries: ["avg", "count"],
                returnDataFrom: "table",
            }
        )
        assert.deepStrictEqual(data, [
            { value: "key2", key1: "Fraise", avg: 16.5, count: 2 },
            { value: "key2", key1: "Rubarbe", avg: 1.5, count: 2 },
        ])
    })
})
