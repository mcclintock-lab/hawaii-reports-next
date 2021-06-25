/**
 * @jest-environment node
 * @group smoke
 */
import { biomass } from "./biomass";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";
import { isFeature, groupBy } from "@seasketch/geoprocessing";

describe("Biomass smoke tests", () => {
  it("has a handler function", () => {
    expect(typeof biomass).toBe("function");
  });
  it("find biomass for all types in new maui", async () => {
    const examples = await getExamplePolygonSketchAll("hawaii-");
    for (const example of examples) {
      const result = await biomass(example);
      const numRegions = Object.keys(
        groupBy(result.biomass, (result) => result.region)
      ).length;
      expect(result.biomass.length).toBe(numRegions * 3);
      result.biomass.forEach((r) => {
        expect(r.sketchCount).toBeGreaterThanOrEqual(0);
      });
      writeResultOutput(result, "biomass", example.properties.name);
    }
  });
});
