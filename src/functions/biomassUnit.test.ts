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
  it("should sum single raster", function (done) {
    parseGeoraster(values, metadata).then(async (georaster: any) => {
      try {
        expect(georaster.numberOfRasters).toEqual(1);
        expect(georaster.projection).toEqual(projection);
        expect(georaster.noDataValue).toEqual(noDataValue);
        expect(georaster.xmin).toEqual(xmin);
        expect(georaster.xmax).toEqual(40.03);
        expect(georaster.ymin).toEqual(13.97);
        expect(georaster.ymax).toEqual(ymax);
        expect(georaster.pixelHeight).toEqual(georaster.pixelHeight);
        expect(georaster.pixelWidth).toEqual(georaster.pixelWidth);
        expect(JSON.stringify(georaster.values)).toEqual(
          JSON.stringify(values)
        );
        const sum = await geoblaze.sum(georaster, poly);
        expect(sum[0]).toBe(4);
        done();
      } catch (error) {
        console.error("Error parsing from simple object", error);
      }
    });
  });
  it("correctly calculates biomassCountByValue", async () => {
    const georaster = await parseGeoraster(values, metadata);
    const result = await biomassCountByValue(
      "browser",
      "mn",
      1,
      [poly],
      georaster
    );
    expect(result.sketchCount).toBe(2);
  });
});
