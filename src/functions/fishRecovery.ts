import {
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
  Polygon,
  toFeatureArray,
} from "@seasketch/geoprocessing";
// @ts-ignore
import geoblaze from "geoblaze";
import logger from "../util/logger";

const rasterUrl = "http://127.0.0.1:8080/browser_biomass_mn.tif";

export interface RasterSumResults {
  /** area of the sketch in square meters */
  sum: number;
}

export interface FishingRecoveryResults {
  /** Total biomass increase (g/m^2) in sketch */
  avgBiomass: number;
  /** Average % biomass increase in sketch */
  avgBiomassPerc: number;
  /** Average length increase (cm) in sketch */
  avgLength: number;
  /** Average % length increase in sketch */
  avgLengthPerc: number;
  biomassUnit: string;
  lengthUnit: string;
}

export async function fishRecovery(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<FishingRecoveryResults> {
  // Read in rasters
  try {
    const sketches = toFeatureArray(sketch);
    const raster = await loadRaster(rasterUrl);

    const biomassAvgs = await Promise.all(
      sketches.map(async (f) => (await geoblaze.sum(raster, f))[0])
    );
    const avgBiomass = biomassAvgs.reduce((maxAvg, sketchAvg) => {
      return Math.max(maxAvg, sketchAvg);
    }, 0);

    // Flatten into array response
    return {
      avgBiomass,
      avgBiomassPerc: 0.12,
      avgLength: 1.2,
      avgLengthPerc: 0.14,
      biomassUnit: "g/m^2",
      lengthUnit: "cm",
    };
  } catch (err) {
    logger.error("fishRecovery error", err);
    throw new Error(err);
  }
}

function loadRaster(url: string): Promise<object> {
  return geoblaze.load(rasterUrl);
}

export default new GeoprocessingHandler(fishRecovery, {
  title: "rasterSum",
  description: "calculates the sum of a raster",
  timeout: 60, // seconds
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
