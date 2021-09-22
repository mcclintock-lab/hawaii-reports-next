// Run inside workspace
// Precalculates overall stats used by habitat function

const fs = require("fs");
// import { FeatureCollection, Polygon } = require("@seasketch/geoprocessing";
const assert = require("assert").strict;
const polys = require("./dist/50m_contour.json");
const area = require("@turf/area").default;
// const deserialize = require("flatgeobuf/lib/cjs/geojson");

const SRC_PATH = `${__dirname}/dist/50m_contour.fgb`;
const DEST_PATH = `${__dirname}/precalc/contourAreaStats.json`;

const buffer = fs.readFileSync(`${SRC_PATH}`);
const bytes = new Uint8Array(buffer);
// const polys = deserialize(bytes); // as FeatureCollection<Polygon>;

const totalArea = polys.features.reduce(
  (sum, feature) => area(feature) + sum,
  0
);

fs.writeFile(
  DEST_PATH,
  JSON.stringify({ totalArea, areaUnit: "meters" }, null, 2),
  (err) =>
    err
      ? console.error("Error", err)
      : console.info(`Successfully wrote ${DEST_PATH}`)
);

assert(totalArea > 0);
