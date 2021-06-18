/**
 * @jest-environment node
 * @group smoke
 */
import { biomass } from "./biomass";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";
import { isFeature } from "@seasketch/geoprocessing";

describe("Biomass smoke tests", () => {
  it("has a handler function", () => {
    expect(typeof biomass).toBe("function");
  });
  it("find biomass for all types in new maui", async () => {
    const example = (await getExamplePolygonSketchAll("hawaii-"))[0];
    const result = await biomass(example);
    expect(result.biomass.length).toBe(3);
    result.biomass.forEach((r) => {
      expect(r.sketchCount).toBeGreaterThan(0);
    });
    writeResultOutput(result, "biomass", example.properties.name);
  });
});
