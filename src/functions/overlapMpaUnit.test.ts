/**
 * @group unit
 */
import { overlapMpa } from "./overlapMpa";
import { getExampleSketchCollections } from "@seasketch/geoprocessing/scripts/testing";

describe("Unit tests", () => {
  test("hawaii-network-test sketch collection should overlap with MMAs", async () => {
    const examples = await getExampleSketchCollections("hawaii-network-test");

    // collection
    const result = await overlapMpa(examples[0]);
    expect(result.mpas.length).toBe(3);

    // individual sketch
    const result2 = await overlapMpa(examples[0].features[0]);
    expect(result2.mpas.length).toBe(1);
  });
});
