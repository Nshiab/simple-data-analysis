import assert from "assert"
import SimpleNodeDB from "../../../../../src/class/SimpleNodeDB.js"

describe("removeMissing", () => {
    const simpleNodeDB = new SimpleNodeDB().start()

    it("should return a table without any missing values", async () => {
        await simpleNodeDB.loadData("employeesForAllColumnsTest", [
            "test/data/employees.json",
        ])

        const data = await simpleNodeDB.removeMissing(
            "employeesForAllColumnsTest",
            [],
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, dataNoNulls)
    })

    it("should return a table without any missing values for a specific column", async () => {
        await simpleNodeDB.loadData("employeesForOneSpecificColumnTest", [
            "test/data/employees.json",
        ])

        const data = await simpleNodeDB.removeMissing(
            "employeesForOneSpecificColumnTest",
            ["Name"],
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, dataNoNullsName)
    })

    it("should return a table without any missing values for multiple specific columns", async () => {
        await simpleNodeDB.loadData("employeesForMultipleSpecificColumnTest", [
            "test/data/employees.json",
        ])

        const data = await simpleNodeDB.removeMissing(
            "employeesForMultipleSpecificColumnTest",
            ["Name", "Salary"],
            {
                returnDataFrom: "table",
            }
        )

        assert.deepStrictEqual(data, dataNoNullsMultipleColumns)
    })

    it("should return a table with null values in any columns", async () => {
        await simpleNodeDB.loadData("employeesInvertTest", [
            "test/data/employees.json",
        ])

        const data = await simpleNodeDB.removeMissing(
            "employeesInvertTest",
            [],
            {
                returnDataFrom: "table",
                invert: true,
            }
        )

        assert.deepStrictEqual(data, dataJustNulls)
    })

    it("should return a table with null values in a specific column", async () => {
        await simpleNodeDB.loadData("employeesInvertOneColumnTest", [
            "test/data/employees.json",
        ])

        const data = await simpleNodeDB.removeMissing(
            "employeesInvertOneColumnTest",
            ["Name"],
            {
                returnDataFrom: "table",
                invert: true,
            }
        )

        assert.deepStrictEqual(data, dataNullsInName)
    })

    simpleNodeDB.done()
})

const dataNoNulls = [
    {
        Name: "OConnell, Donald",
        "Hire date": "21-JUN-07",
        Job: "Clerk",
        Salary: "2600",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "1,94%",
    },
    {
        Name: "OConnell, Donald",
        "Hire date": "21-JUN-07",
        Job: "Clerk",
        Salary: "2600",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "1,94%",
    },
    {
        Name: "Hartstein, Michael",
        "Hire date": "17-FEB-04",
        Job: "Manager",
        Salary: "13000",
        "Departement or unit": "20",
        "End-of_year-BONUS?": "2,71%",
    },
    {
        Name: "Fay, Pat",
        "Hire date": "17-AUG-05",
        Job: "Representative",
        Salary: "6000",
        "Departement or unit": "20",
        "End-of_year-BONUS?": "18,68%",
    },
    {
        Name: "Mavris, Susan",
        "Hire date": "07-JUN-02",
        Job: "Salesperson",
        Salary: "6500",
        "Departement or unit": "40",
        "End-of_year-BONUS?": "23,47%",
    },
    {
        Name: "Higgins, Shelley",
        "Hire date": "07-JUN-02",
        Job: "Manager",
        Salary: "12008",
        "Departement or unit": "110",
        "End-of_year-BONUS?": "17,09%",
    },
    {
        Name: "Kochhar, Neena",
        "Hire date": "21-SEP-05",
        Job: "Vice-president",
        Salary: '"&6%"',
        "Departement or unit": "90",
        "End-of_year-BONUS?": "11,6%",
    },
    {
        Name: "Hunold, Alexander",
        "Hire date": "03-JAN-06",
        Job: "Programmer",
        Salary: "9000",
        "Departement or unit": "60",
        "End-of_year-BONUS?": "23,01%",
    },
    {
        Name: "Ernst, Bruce",
        "Hire date": "21-MAY-07",
        Job: "Programmer",
        Salary: "6000",
        "Departement or unit": "60",
        "End-of_year-BONUS?": "25,91%",
    },
    {
        Name: "Lorentz, Diana",
        "Hire date": "07-ARB-07",
        Job: "Programmer",
        Salary: "4200",
        "Departement or unit": "60",
        "End-of_year-BONUS?": "13,17%",
    },
]

const dataNoNullsName = [
    {
        Name: "OConnell, Donald",
        "Hire date": "21-JUN-07",
        Job: "Clerk",
        Salary: "2600",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "1,94%",
    },
    {
        Name: "OConnell, Donald",
        "Hire date": "21-JUN-07",
        Job: "Clerk",
        Salary: "2600",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "1,94%",
    },
    {
        Name: "Grant, Douglas",
        "Hire date": "13-JAN-08",
        Job: "Clerk",
        Salary: null,
        "Departement or unit": "50",
        "End-of_year-BONUS?": "23,39%",
    },
    {
        Name: "Hartstein, Michael",
        "Hire date": "17-FEB-04",
        Job: "Manager",
        Salary: "13000",
        "Departement or unit": "20",
        "End-of_year-BONUS?": "2,71%",
    },
    {
        Name: "Fay, Pat",
        "Hire date": "17-AUG-05",
        Job: "Representative",
        Salary: "6000",
        "Departement or unit": "20",
        "End-of_year-BONUS?": "18,68%",
    },
    {
        Name: "Mavris, Susan",
        "Hire date": "07-JUN-02",
        Job: "Salesperson",
        Salary: "6500",
        "Departement or unit": "40",
        "End-of_year-BONUS?": "23,47%",
    },
    {
        Name: "Higgins, Shelley",
        "Hire date": "07-JUN-02",
        Job: "Manager",
        Salary: "12008",
        "Departement or unit": "110",
        "End-of_year-BONUS?": "17,09%",
    },
    {
        Name: "King, Steven",
        "Hire date": null,
        Job: "President",
        Salary: "24000",
        "Departement or unit": "90",
        "End-of_year-BONUS?": "2,46%",
    },
    {
        Name: "Kochhar, Neena",
        "Hire date": "21-SEP-05",
        Job: "Vice-president",
        Salary: '"&6%"',
        "Departement or unit": "90",
        "End-of_year-BONUS?": "11,6%",
    },
    {
        Name: "De Haan, Lex",
        "Hire date": null,
        Job: "Vice-president",
        Salary: "17000",
        "Departement or unit": "90",
        "End-of_year-BONUS?": "23,43%",
    },
]

const dataNoNullsMultipleColumns = [
    {
        Name: "OConnell, Donald",
        "Hire date": "21-JUN-07",
        Job: "Clerk",
        Salary: "2600",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "1,94%",
    },
    {
        Name: "OConnell, Donald",
        "Hire date": "21-JUN-07",
        Job: "Clerk",
        Salary: "2600",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "1,94%",
    },
    {
        Name: "Hartstein, Michael",
        "Hire date": "17-FEB-04",
        Job: "Manager",
        Salary: "13000",
        "Departement or unit": "20",
        "End-of_year-BONUS?": "2,71%",
    },
    {
        Name: "Fay, Pat",
        "Hire date": "17-AUG-05",
        Job: "Representative",
        Salary: "6000",
        "Departement or unit": "20",
        "End-of_year-BONUS?": "18,68%",
    },
    {
        Name: "Mavris, Susan",
        "Hire date": "07-JUN-02",
        Job: "Salesperson",
        Salary: "6500",
        "Departement or unit": "40",
        "End-of_year-BONUS?": "23,47%",
    },
    {
        Name: "Higgins, Shelley",
        "Hire date": "07-JUN-02",
        Job: "Manager",
        Salary: "12008",
        "Departement or unit": "110",
        "End-of_year-BONUS?": "17,09%",
    },
    {
        Name: "King, Steven",
        "Hire date": null,
        Job: "President",
        Salary: "24000",
        "Departement or unit": "90",
        "End-of_year-BONUS?": "2,46%",
    },
    {
        Name: "Kochhar, Neena",
        "Hire date": "21-SEP-05",
        Job: "Vice-president",
        Salary: '"&6%"',
        "Departement or unit": "90",
        "End-of_year-BONUS?": "11,6%",
    },
    {
        Name: "De Haan, Lex",
        "Hire date": null,
        Job: "Vice-president",
        Salary: "17000",
        "Departement or unit": "90",
        "End-of_year-BONUS?": "23,43%",
    },
    {
        Name: "Hunold, Alexander",
        "Hire date": "03-JAN-06",
        Job: "Programmer",
        Salary: "9000",
        "Departement or unit": "60",
        "End-of_year-BONUS?": "23,01%",
    },
]

const dataJustNulls = [
    {
        Name: null,
        "Hire date": "17-SEP-03",
        Job: "Assistant",
        Salary: "4400",
        "Departement or unit": "10",
        "End-of_year-BONUS?": "17,51%",
    },
    {
        Name: null,
        "Hire date": "07-JUN-02",
        Job: "Salesperson",
        Salary: "10000",
        "Departement or unit": '"xyz"',
        "End-of_year-BONUS?": "17,63%",
    },
    {
        Name: null,
        "Hire date": "07-JUN-02",
        Job: "Accountant",
        Salary: "8300",
        "Departement or unit": "110",
        "End-of_year-BONUS?": "15,7%",
    },
    {
        Name: null,
        "Hire date": "14-JUN-04",
        Job: "Clerk",
        Salary: "3300",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "18,54%",
    },
    {
        Name: "King, Steven",
        "Hire date": null,
        Job: "President",
        Salary: "24000",
        "Departement or unit": "90",
        "End-of_year-BONUS?": "2,46%",
    },
    {
        Name: "De Haan, Lex",
        "Hire date": null,
        Job: "Vice-president",
        Salary: "17000",
        "Departement or unit": "90",
        "End-of_year-BONUS?": "23,43%",
    },
    {
        Name: "Austin, David",
        "Hire date": null,
        Job: "Programmer",
        Salary: "4800",
        "Departement or unit": null,
        "End-of_year-BONUS?": "6,89%",
    },
    {
        Name: "Mourgos, Kevin",
        "Hire date": null,
        Job: "Manager",
        Salary: "5800",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "19,07%",
    },
    {
        Name: "Markle, Steven",
        "Hire date": null,
        Job: "Clerk",
        Salary: "2200",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "11,26%",
    },
    {
        Name: "Tobias, Sigal",
        "Hire date": "24-JUL-05",
        Job: null,
        Salary: "2800",
        "Departement or unit": null,
        "End-of_year-BONUS?": null,
    },
]

const dataNullsInName = [
    {
        Name: null,
        "Hire date": "17-SEP-03",
        Job: "Assistant",
        Salary: "4400",
        "Departement or unit": "10",
        "End-of_year-BONUS?": "17,51%",
    },
    {
        Name: null,
        "Hire date": "07-JUN-02",
        Job: "Salesperson",
        Salary: "10000",
        "Departement or unit": '"xyz"',
        "End-of_year-BONUS?": "17,63%",
    },
    {
        Name: null,
        "Hire date": "07-JUN-02",
        Job: "Accountant",
        Salary: "8300",
        "Departement or unit": "110",
        "End-of_year-BONUS?": "15,7%",
    },
    {
        Name: null,
        "Hire date": "14-JUN-04",
        Job: "Clerk",
        Salary: "3300",
        "Departement or unit": "50",
        "End-of_year-BONUS?": "18,54%",
    },
]
