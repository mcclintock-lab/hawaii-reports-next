/**
 * @jest-environment node
 * @group unit
 */
import { area } from "./area";
import { getExampleFeaturesByName } from "@seasketch/geoprocessing/scripts/testing";
import { Feature, Polygon } from "@seasketch/geoprocessing";
import { biomassCountByValue } from "./biomass";
// @ts-ignore
import parseGeoraster from "georaster";
// @ts-ignore
import geoblaze from "geoblaze";

const values = [
  [
    [0, 1, 2],
    [0, 0, 0],
    [2, 1, 1],
  ],
];
const noDataValue = 3;
const projection = 4326;
const xmin = 40;
const ymax = 14;
const pixelWidth = 0.01;
const pixelHeight = 0.01;
const metadata = {
  noDataValue,
  projection,
  xmin,
  ymax,
  pixelWidth,
  pixelHeight,
};

// Overlaps with bottom row of raster
const poly: Feature<Polygon> = {
  type: "Feature",
  properties: [],
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [40, 13],
        [40, 13.98],
        [40.03, 13.98],
        [40.03, 13],
        [40, 13],
      ],
    ],
  },
};

describe("Biomass unit tests", () => {
  it("correctly calculates biomassCountByValue", async () => {
    const georaster = await parseGeoraster(values, metadata);
    const result = await biomassCountByValue(
      { type: "browser", region: "mn", value: 1, totalCount: 3 },
      [poly],
      georaster
    );
    expect(result.sketchCount).toBe(2);
  });
});
