import {
  Sketch,
  SketchCollection,
  Feature,
  GeoprocessingHandler,
  Polygon,
  toSketchArray,
  bboxOverlap,
} from "@seasketch/geoprocessing";

import { REGION_ID, Region, regions } from "../region";

import bbox from "@turf/bbox";
// @ts-ignore
import geoblaze from "geoblaze";
import logger from "../util/logger";

/** Biomass types available to project */
const BIOMASS_TYPES = ["browser", "grazer", "scraper"] as const;
export type BIOMASS_TYPE = typeof BIOMASS_TYPES[number];

/** Biomass raster datasource */
export interface BiomassDatasource {
  type: string;
  region: string;
  /** URL of the raster file */
  url: string;
}

export interface BiomassRunParams {
  /** biomass type */
  type: BIOMASS_TYPE;
  /** biomass region */
  region: REGION_ID;
  /** high quantile raster cell value */
  value: number;
  /** total number of cells with value */
  totalCount: number;
}

/** Biomass analysis result for a single biomass type and region */
export interface BiomassResult {
  type: BIOMASS_TYPE;
  region: REGION_ID;
  /** Total count of cells with high quantile value */
  totalCount: number;
  /** Total count of cells with high quantile value within sketch */
  sketchCount: number;
}

/** Biomass function results */
export interface BiomassResults {
  biomass: BiomassResult[];
}

/** Analysis run parameters. Includes precomputed stats collected from rasters */
const biomassRuns: BiomassRunParams[] = [
  {
    type: "browser",
    region: "mn",
    value: 37,
    totalCount: 20363,
  },
  {
    type: "browser",
    region: "whi",
    value: 41,
    totalCount: 4782,
  },
  {
    type: "grazer",
    region: "mn",
    value: 29,
    totalCount: 23630,
  },
  {
    type: "grazer",
    region: "whi",
    value: 33,
    totalCount: 4765,
  },
  {
    type: "scraper",
    region: "mn",
    value: 21,
    totalCount: 23791,
  },
  {
    type: "scraper",
    region: "whi",
    value: 25,
    totalCount: 4913,
  },
];

export async function biomass(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<BiomassResults> {
  /** Raster datasource, fallback to localhost in test environment */
  const datasourceUrl =
    process.env.NODE_ENV === "test"
      ? "http://127.0.0.1:8080"
      : "https://gp-hawaii-reports-next-datasets.s3.us-west-1.amazonaws.com";

  /** Biomass rasters available for project */
  const biomassDatasources: BiomassDatasource[] = [
    {
      type: "browser",
      region: "mn",
      url: `${datasourceUrl}/browser_biomass_mn.tif`,
    },
    {
      type: "browser",
      region: "whi",
      url: `${datasourceUrl}/browser_biomass_whi.tif`,
    },
    {
      type: "grazer",
      region: "mn",
      url: `${datasourceUrl}/grazer_biomass_mn.tif`,
    },
    {
      type: "grazer",
      region: "whi",
      url: `${datasourceUrl}/grazer_biomass_whi.tif`,
    },
    {
      type: "scraper",
      region: "mn",
      url: `${datasourceUrl}/scraper_biomass_mn.tif`,
    },
    {
      type: "scraper",
      region: "whi",
      url: `${datasourceUrl}/scraper_biomass_whi.tif`,
    },
  ];

  try {
    const sketches = toSketchArray(sketch);

    // Find regions that overlap sketch and get just their ID
    const overlappingRegions = regions
      .map((region) => bboxOverlap(region.bbox, sketch.bbox || bbox(sketch)))
      .reduce<Region["id"][]>(
        (overlapIds, isOverlap, index) =>
          isOverlap ? overlapIds.concat([regions[index].id]) : overlapIds,
        []
      );

    // Get run parameters for remaining regions
    const finalRuns = biomassRuns.filter((rp) =>
      overlappingRegions.includes(rp.region)
    );

    const results: BiomassResult[] = [];
    for (let x = 0; x < finalRuns.length; x++) {
      const { region, type, value, totalCount } = finalRuns[x];
      const datasource = biomassDatasources.find(
        (d) => d.region === region && d.type === type
      );
      if (!datasource) {
        throw new Error(
          `could not find matching datasource for ${region} ${type}`
        );
      }
      const raster = await geoblaze.load(datasource.url);
      const result = await biomassCountByValue(finalRuns[x], sketches, raster);
      results.push(result);
    }

    return {
      biomass: results,
    };
  } catch (err) {
    logger.error("biomass error", err);
    throw new Error(err);
  }
}

/**
 * Core raster analysis - given raster, counts number of cells with value that are within Feature polygons
 */
export async function biomassCountByValue(
  params: BiomassRunParams,
  /** Polygons to filter for */
  features: Feature<Polygon>[],
  raster: object
): Promise<BiomassResult> {
  // Count cells with high quant value in every polygon
  const { type, region, value, totalCount } = params;
  const sketchCount = (
    await Promise.all(
      features.map(async (feature) => {
        // @ts-ignore
        const binaryRaster = await geoblaze.rasterCalculator(
          raster,
          (a: any) => (a === value ? 1 : 0) // Make cells matching value 1, all others 0
        );
        // @ts-ignore
        const count = await geoblaze.sum(binaryRaster, feature)[0]; // Sum binary giving count
        return count as number;
      })
    )
  ).reduce((sum, sketchCount) => {
    return sketchCount + sum;
  }, 0);

  return {
    type,
    region,
    totalCount,
    sketchCount,
  };
}

export async function loadRaster(url: string): Promise<object> {
  return geoblaze.load(url);
}

export default new GeoprocessingHandler(biomass, {
  title: "biomass",
  description: "calculates biomass within given sketch",
  timeout: 60, // seconds
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
