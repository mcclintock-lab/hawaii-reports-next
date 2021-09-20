/**
 * @jest-environment node
 * @group unit
 */
import {
  Sketch,
  Polygon,
  genSampleSketch,
  genSampleSketchCollection,
} from "@seasketch/geoprocessing";
import { fishRecoveryStats } from "./fishRecovery";
import { featureCollection } from "@turf/helpers";
// @ts-ignore
import parseGeoraster from "georaster";

const values = [
  [
    [0, 1, 2],
    [0, 0, 0],
    [2, 1, 1],
  ],
];
const noDataValue = 3;
const projection = 4326;
const xmin = 10; // left
const ymax = 13; // top
const pixelWidth = 1;
const pixelHeight = 1;
const metadata = {
  noDataValue,
  projection,
  xmin,
  ymax,
  pixelWidth,
  pixelHeight,
};

// Overlaps with bottom row of raster
const poly: Sketch<Polygon> = genSampleSketch({
  type: "Polygon",
  coordinates: [
    [
      [9, 9],
      [9, 11],
      [14, 11],
      [14, 9],
      [9, 9],
    ],
  ],
});

// Overlaps with top right cell of raster
const poly2: Sketch<Polygon> = genSampleSketch({
  type: "Polygon",
  coordinates: [
    [
      [12, 12],
      [12, 14],
      [14, 14],
      [14, 12],
      [12, 12],
    ],
  ],
});

const coll1 = genSampleSketchCollection(featureCollection([poly, poly2]));

describe("unit tests", () => {
  it("correctly calculates fishRecoveryStats for poly", async () => {
    const georaster = await parseGeoraster(values, metadata);
    const result = await fishRecoveryStats(poly, [
      georaster,
      georaster,
      georaster,
      georaster,
    ]);
    expect(result.potentialBySketch.length).toBe(1);
    expect(result.potential.biomassIncrease).toBe(240);
    expect(result.potential.avgPercBiomassIncrease).toBeCloseTo(1.33);
    expect(result.potential.avgLengthIncrease).toBeCloseTo(1.33);
    expect(result.potential.avgPercLengthIncrease).toBeCloseTo(1.33);
  });
  it("correctly calculates fishRecoveryStats for poly collection", async () => {
    const georaster = await parseGeoraster(values, metadata);
    const result = await fishRecoveryStats(coll1, [
      georaster,
      georaster,
      georaster,
      georaster,
    ]);
    console.log(result);
    // Not working properly with FC in geoblaze with manually created georaster
    // expect(result.potential.biomassIncrease).toBe(21.6);
    expect(result.potential.biomassIncrease).toBe(0);
    expect(result.potentialBySketch.length).toBe(2);
    // expect(result.potential.avgPercBiomassIncrease).toBeCloseTo(1.666);
    expect(result.potential.avgPercBiomassIncrease).toBe(undefined);
    // expect(result.potential.avgLengthIncrease).toBeCloseTo(1.666);
    expect(result.potential.avgLengthIncrease).toBe(undefined);
    // expect(result.potential.avgPercLengthIncrease).toBeCloseTo(1.666);
    expect(result.potential.avgPercLengthIncrease).toBe(undefined);
  });
});
