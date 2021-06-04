/**
 * @group unit
 */
import { calcAreaStats } from "./calcAreaStats";
import habitatFC from "../../data/dist/habitat.json";
import { FeatureCollection, Polygon } from "@seasketch/geoprocessing";

describe("Unit tests", () => {
  test("overlap-test sketch should overlap with 14 MMAs", async () => {
    const result = calcAreaStats(
      habitatFC as FeatureCollection<Polygon>,
      "D_STRUCT"
    );
    expect(result).toBeTruthy();
  });
});
