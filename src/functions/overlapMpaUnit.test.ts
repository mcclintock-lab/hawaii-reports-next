/**
 * @group unit
 */
import { overlapMpa } from "./overlapMpa";
import { getExampleSketchesByName } from "@seasketch/geoprocessing/scripts/testing";

describe("Unit tests", () => {
  test("overlap-test sketch should overlap with 14 MMAs", async () => {
    const examples = await getExampleSketchesByName();
    const result = await overlapMpa(examples["overlap-test"]);
    expect(result.mpas.length).toBe(14);
  });
});
