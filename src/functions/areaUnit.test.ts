/**
 * @group unit
 */
import { area } from "./area";
import { getExampleFeaturesByName } from "@seasketch/geoprocessing/scripts/testing";

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
    const result = await area(feature);
    const fivePerc = result.area * 0.005;
    expect(result.area).toBeLessThan(penguinPointAreaSqMeters + fivePerc);
    expect(result.area).toBeGreaterThan(penguinPointAreaSqMeters - fivePerc);
  });
});
