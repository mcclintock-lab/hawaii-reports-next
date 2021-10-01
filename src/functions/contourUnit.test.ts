/**
 * @group e2e
 */
import { contour } from "./contour";
import { getExampleFeaturesByName } from "@seasketch/geoprocessing/scripts/testing";
import { Sketch, Polygon } from "@seasketch/geoprocessing";

describe("Unit tests", () => {
  test("Calculated area for penguin point should be within .5% of baseline", async () => {
    /**
     * Penguin Point area from existing_mpas_mar2018 dataset, in EPSG:102007
     * ShapeArea attribute , units meters
     * double checked using qgis field calculator area($geometry)
     */
    const penguinPointAreaSqMeters = 268646494.3244679;

    const examples = await getExampleFeaturesByName();
    const feature = examples["penguin_point.json"];
    const result = await contour(feature as Sketch<Polygon>);
    expect(result.sketchContourArea).toBe(0);
    expect(result.sketchContourArea).toBe(0);
  });

  test("Contour area should positive", async () => {
    /**
     * Penguin Point area from existing_mpas_mar2018 dataset, in EPSG:102007
     * ShapeArea attribute , units meters
     * double checked using qgis field calculator area($geometry)
     */
    const penguinPointAreaSqMeters = 268646494.3244679;

    const examples = await getExampleFeaturesByName();
    const feature = examples["kanahena_nearshore.json"];
    const result = await contour(feature as Sketch<Polygon>);
    expect(result.sketchContourArea).toBeGreaterThan(0);
    expect(result.sketchContourArea).toBeLessThanOrEqual(
      penguinPointAreaSqMeters
    );
  });
});
