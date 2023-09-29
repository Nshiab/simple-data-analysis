import assert from "assert"
import SimpleNodeDB from "../../../src/class/SimpleNodeDB.js"

describe("logDescription", () => {
    let simpleNodeDB: SimpleNodeDB
    before(async function () {
        simpleNodeDB = await new SimpleNodeDB().start()
    })
    after(async function () {
        await simpleNodeDB.done()
    })

    it("should return the count of null values, non null values, and distinct values in each column of a table", async () => {
        await simpleNodeDB.loadData("employees", ["test/data/employees.json"])

        const description = await simpleNodeDB.logDescription("employees", {
            verbose: false,
        })

        assert.deepStrictEqual(description, [
            {
                _: "type",
                Name: "VARCHAR",
                "Hire date": "VARCHAR",
                Job: "VARCHAR",
                Salary: "JSON",
                "Department or unit": "JSON",
                "End-of_year-BONUS?": "VARCHAR",
            },
            {
                Name: 4,
                "Hire date": 5,
                Job: 5,
                Salary: 3,
                "Department or unit": 5,
                "End-of_year-BONUS?": 4,
                _: "0-Null",
            },
            {
                Name: 47,
                "Hire date": 46,
                Job: 46,
                Salary: 48,
                "Department or unit": 46,
                "End-of_year-BONUS?": 47,
                _: "1-Not null",
            },
            {
                Name: 46,
                "Hire date": 42,
                Job: 9,
                Salary: 33,
                "Department or unit": 10,
                "End-of_year-BONUS?": 46,
                _: "2-Distinct",
            },
            {
                Name: 51,
                "Hire date": 51,
                Job: 51,
                Salary: 51,
                "Department or unit": 51,
                "End-of_year-BONUS?": 51,
                _: "3-Total",
            },
        ])
    })
})
