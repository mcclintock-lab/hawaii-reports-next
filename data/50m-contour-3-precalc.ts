// Run inside workspace
// Calculates static area stats

import fs from "fs";
import { calcAreaStats } from "../src/util/calcAreaStats";
import { FeatureCollection, Polygon } from "@seasketch/geoprocessing";
import { strict as assert } from "assert";

const INFILE = "dist/50m_contour_poly.geojson";
const OUTFILE = "precalc/contourAreaStats.json";
const ATTRIB = "Island";

const fc = JSON.parse(fs.readFileSync(`${__dirname}/${INFILE}`).toString());

const stats = calcAreaStats(fc as FeatureCollection<Polygon>, ATTRIB);

assert(stats.totalArea > 0);
assert(stats.areaByType.length > 0);
const sumPerc = stats.areaByType.reduce<number>(
  (sum, areaType) => areaType.percArea + sum,
  0
);
assert(sumPerc > 0.99 && sumPerc < 1.01);

const filename = `${__dirname}/${OUTFILE}`;
fs.writeFile(filename, JSON.stringify(stats, null, 2), (err) =>
  err
    ? console.error("Error", err)
    : console.info(`Successfully wrote ${filename}`)
);

/**
Why are the area calculations different?

From QGIS?
2193151763

From dst geojson by this script:
3431458951

From src fgb:
ogrinfo -dialect SQLite -sql 'select sum(ST_Area(ST_Transform(geometry, 3857))) from "50m_contour"' 50m_contour/50m_contour.fgb
2521979572

From dst fgb:
ogrinfo -dialect SQLite -sql 'select sum(ST_Area(ST_Transform(geometry, 3857))) from "50m_contour_poly"' ../dist/50m_contour_poly.fgb
3952730932
 */
