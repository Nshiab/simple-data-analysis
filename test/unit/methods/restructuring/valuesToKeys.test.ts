import assert from "assert"
import valuesToKeys from "../../../../src/methods/restructuring/valuesToKeys.js"

describe("valuesToKeys", function () {
    it("should take two keys, one for the new keys and one for their values, and create new keys based on them", function () {
        const data = [
            { department: "accounting", year: "2015", nbEmployees: 10 },
            { department: "accounting", year: "2016", nbEmployees: 9 },
            { department: "accounting", year: "2017", nbEmployees: 15 },
            { department: "accounting", year: "2018", nbEmployees: 11 },
            { department: "accounting", year: "2019", nbEmployees: 25 },
            { department: "accounting", year: "2020", nbEmployees: 32 },
            { department: "R&D", year: "2015", nbEmployees: 1 },
            { department: "R&D", year: "2016", nbEmployees: 2 },
            { department: "R&D", year: "2017", nbEmployees: 5 },
            { department: "R&D", year: "2018", nbEmployees: 2 },
            { department: "R&D", year: "2019", nbEmployees: 2 },
            { department: "R&D", year: "2020", nbEmployees: 3 },
            { department: "sales", year: "2015", nbEmployees: 2 },
            { department: "sales", year: "2016", nbEmployees: 7 },
            { department: "sales", year: "2017", nbEmployees: 15 },
            { department: "sales", year: "2018", nbEmployees: 32 },
            { department: "sales", year: "2019", nbEmployees: 45 },
            { department: "sales", year: "2020", nbEmployees: 27 },
        ]

        const newData = valuesToKeys(data, "year", "nbEmployees")

        assert.deepStrictEqual(newData, [
            {
                department: "accounting",
                "2015": 10,
                "2016": 9,
                "2017": 15,
                "2018": 11,
                "2019": 25,
                "2020": 32,
            },
            {
                department: "R&D",
                "2015": 1,
                "2016": 2,
                "2017": 5,
                "2018": 2,
                "2019": 2,
                "2020": 3,
            },
            {
                department: "sales",
                "2015": 2,
                "2016": 7,
                "2017": 15,
                "2018": 32,
                "2019": 45,
                "2020": 27,
            },
        ])
    })
})