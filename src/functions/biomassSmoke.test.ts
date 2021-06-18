/**
 * @jest-environment node
 * @group smoke
 */
import { biomass } from "./biomass";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Biomass smoke tests", () => {
  it("has a handler function", () => {
    expect(typeof biomass).toBe("function");
  });
  it.only("calculates biomass for hawaii-kaunakakai", async () => {
    const example = (await getExamplePolygonSketchAll("hawaii-kaunakakai"))[0];
    const result = await biomass(example);
    expect(result).toBeTruthy();
    writeResultOutput(result, "biomass", example.properties.name);
    expect(Object.keys(result).length).toBe(3);
  });
});
