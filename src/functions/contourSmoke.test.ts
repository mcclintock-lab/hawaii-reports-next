/**
 * @group smoke
 */
import { contour } from "./contour";
import { STUDY_REGION_AREA_SQ_METERS } from "./areaConstants";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof contour).toBe("function");
  });
  test("tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await contour(example);
      expect(result.totalArea).toBeGreaterThan(0);
      expect(result.totalArea).toBeLessThanOrEqual(STUDY_REGION_AREA_SQ_METERS);
      writeResultOutput(result, "contour", example.properties.name);
    }
  });
});
