/**
 * @group unit
 */
import Handler from "./habitat";
import habitatAreaStats from "../../data/precalc/habitatAreaStats.json";
import {
  getExamplePolygonSketches,
  getExamplePolygonSketchCollections,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";
import { HAB_TYPE_FIELD } from "./habitatConstants";

const habitat = Handler.func;

describe("Habitat Unit tests", () => {
  test.only("hawaii-habitat-kaunakakai - Habitat stats are complete", async () => {
    const example = (
      await getExamplePolygonSketches("hawaii-habitat-kaunakakai")
    )[0];
    const result = await habitat(example);
    // Test perc area between 0 and 1 for each hab type
    expect(result.totalArea).toBe(habitatAreaStats.totalArea);
    habitatAreaStats.areaByType.forEach((h) => {
      expect(h.percArea).toBeGreaterThanOrEqual(0);
      expect(h.percArea).toBeLessThanOrEqual(1);
      expect(h[HAB_TYPE_FIELD].length).toBeGreaterThan(0);
    });
  });

  test.only("hawaii-network-test - Habitat stats are complete", async () => {
    const example = (
      await getExamplePolygonSketchCollections("hawaii-network-test")
    )[0];
    const result = await habitat(example);
    // Test perc area between 0 and 1 for each hab type
    expect(result.totalArea).toBe(habitatAreaStats.totalArea);
    habitatAreaStats.areaByType.forEach((h) => {
      expect(h.percArea).toBeGreaterThanOrEqual(0);
      expect(h.percArea).toBeLessThanOrEqual(1);
      expect(h[HAB_TYPE_FIELD].length).toBeGreaterThan(0);
    });
  });
});
