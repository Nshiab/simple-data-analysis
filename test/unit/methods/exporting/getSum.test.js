import assert from "assert";
import getSum from "../../../../src/methods/exporting/getSum.js";
const data = [
    { key1: 66, key2: 5 },
    { key1: 88, key2: null },
    { key1: 77, key2: 9 },
    { key1: 99, key2: -11.1 },
    { key1: 44, key2: 6 },
    { key1: 55, key2: undefined },
    { key1: 44, key2: "haha" },
];
describe("getSum", function () {
    it("should return the sum from key holding all numbers", function () {
        const sum = getSum(data, "key1");
        assert.deepEqual(sum, 473);
    });
    it("should throw an error when different types", function () {
        assert.throws(() => getSum(data, "key2"));
    });
});
//# sourceMappingURL=getSum.test.js.map