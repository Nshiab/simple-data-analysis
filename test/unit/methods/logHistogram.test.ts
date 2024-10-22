import { assertEquals } from "jsr:@std/assert";
import SimpleDB from "../../../src/class/SimpleDB.ts";
import { formatNumber } from "jsr:@nshiab/journalism@1";

const sdb = new SimpleDB();

Deno.test("should log a histogram", async () => {
  const table = sdb.newTable();

  await table.loadData("test/data/files/dailyTemperatures.csv");

  await table.logHistogram("t");
  // How to test?
  assertEquals(true, true);
});
Deno.test("should log a histogram with options", async () => {
  const table = sdb.newTable();

  await table.loadData("test/data/files/dailyTemperatures.csv");

  await table.logHistogram("t", {
    width: 10,
    bins: 25,
    compact: true,
    formatLabels(a, b) {
      return `${formatNumber(a, { decimals: 1 })} to ${
        formatNumber(b, { decimals: 1 })
      }°C`;
    },
  });
  // How to test?
  assertEquals(true, true);
});

await sdb.done();