import {
  Sketch,
  SketchCollection,
  isSketchCollection,
  GeoprocessingHandler,
  Polygon,
  loadCogWindow,
} from "@seasketch/geoprocessing";

import bbox from "@turf/bbox";
import { mean, sum } from "simple-statistics";

// @ts-ignore
import geoblaze, { Georaster } from "geoblaze";

export interface FishRecoveryMetric {
  /** Name of sketch or sketch collection */
  sketchName: string;
  /** Total biomass increase in sketch */
  biomassIncrease?: number;
  /** Average % biomass increase in sketch */
  avgPercBiomassIncrease?: number;
  /** Average length increase in sketch */
  avgLengthIncrease?: number;
  /** Average % length increase in sketch */
  avgPercLengthIncrease?: number;
}

/** Fish recovery potential by sketch */
export interface FishRecoveryResults {
  /** recovery potential by sketch */
  potentialBySketch: FishRecoveryMetric[];
  /** total recovery potential */
  potential: FishRecoveryMetric;
  /** unit name for length metric */
  lengthUnits: string;
  /** unit name for biomass metric */
  areaDensityUnits: string;
}

export async function fishRecovery(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<FishRecoveryResults> {
  if (!sketch) throw new Error("Missing input sketch");
  // Raster dataset filenames.  Cells wtith noDataValue will not be included in calculations
  const rasterConfig = [
    {
      filename: "7_MHI_Biomass_Increase_NoFishing_cog.tif",
      noDataValue: -9999,
    },
    {
      filename: "MHI_Biomass_Percent_Increase_cog.tif",
      noDataValue: -3.4028234663852886e38,
    },
    {
      filename: "8_MHI_Length_Increase_NoFishing_cog.tif",
      noDataValue: -9999,
    },
    {
      filename: "MHI_Length_Percent_Increase_cog.tif",
      noDataValue: -3.4028234663852886e38,
    },
  ];
  // Generate hash of raster URLs keyed by filename, fallback to localhost in test environment
  const rasterUrls = rasterConfig.map((config) =>
    process.env.NODE_ENV === "test"
      ? `http://127.0.0.1:8080/${config.filename}`
      : `https://gp-hawaii-reports-next-datasets.s3.us-west-1.amazonaws.com/${config.filename}`
  );

  const box = sketch.bbox || bbox(sketch);

  // Load all the rasters first, then calc stats.
  const rasters = await Promise.all(
    rasterUrls.map(
      async (rasterUrl, index) =>
        await loadCogWindow(rasterUrl, {
          windowBox: box,
          noDataValue: rasterConfig[index].noDataValue,
        })
    )
  );
  return await fishRecoveryStats(sketch, rasters);
}

/**
 * Core raster analysis - given raster, counts number of cells with value that are within Feature polygons
 */
export async function fishRecoveryStats(
  /** Polygons to filter for */
  sketch: Sketch<Polygon> | SketchCollection<Polygon>,
  /** fishRecovery rasters to search */
  rasters: Georaster[]
): Promise<FishRecoveryResults> {
  // Calculate stats for each sketch
  const sketches = isSketchCollection(sketch) ? sketch.features : [sketch];
  const featureStats = sketches.map((curSketch) => ({
    sketchName: curSketch.properties.name,
    biomassIncrease: geoblaze.sum(rasters[0], curSketch)[0] * 60,
    avgPercBiomassIncrease: geoblaze.mean(rasters[1], curSketch)[0],
    avgLengthIncrease: geoblaze.mean(rasters[2], curSketch)[0],
    avgPercLengthIncrease: geoblaze.mean(rasters[3], curSketch)[0],
  }));

  // rollup the numbers, means use an imperfect average of averages
  const biomassIncreaseValues = getStatByName(featureStats, "biomassIncrease");
  const biomassIncrease = biomassIncreaseValues.length
    ? sum(biomassIncreaseValues)
    : undefined;

  const avgPercBiomassIncreaseValues = getStatByName(
    featureStats,
    "avgPercBiomassIncrease"
  );
  const avgPercBiomassIncrease = avgPercBiomassIncreaseValues.length
    ? mean(avgPercBiomassIncreaseValues)
    : undefined;

  const avgLengthIncreaseValues = getStatByName(
    featureStats,
    "avgLengthIncrease"
  );
  const avgLengthIncrease = avgLengthIncreaseValues.length
    ? mean(avgLengthIncreaseValues)
    : undefined;

  const avgPercLengthIncreaseValues = getStatByName(
    featureStats,
    "avgPercLengthIncrease"
  );
  const avgPercLengthIncrease = avgPercLengthIncreaseValues.length
    ? mean(avgPercLengthIncreaseValues)
    : undefined;

  return {
    potentialBySketch: featureStats,
    potential: {
      sketchName: sketch.properties.name,
      biomassIncrease,
      avgPercBiomassIncrease,
      avgLengthIncrease,
      avgPercLengthIncrease,
    },
    lengthUnits: "cm",
    areaDensityUnits: "g/m^2",
  };
}

export default new GeoprocessingHandler(fishRecovery, {
  title: "fishRecovery",
  description: "calculates fishRecovery potential within given sketch",
  timeout: 120, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});

/**
 * Returns an array of values for given stat name from an array of stat objects.  Falsy values are filtered out
 * @param statRecord
 * @param statName
 * @returns
 */
const getStatByName = (statRecord: Record<string, any>[], statName: string) => {
  return statRecord.reduce<number[]>(
    (list, stat) =>
      !stat[statName] && stat[statName] !== 0
        ? list
        : list.concat(stat[statName]),
    []
  );
};
