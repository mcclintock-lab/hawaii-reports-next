import {
  Sketch,
  SketchCollection,
  Feature,
  GeoprocessingHandler,
  Polygon,
  toSketchArray,
  bboxOverlap,
  BBox,
} from "@seasketch/geoprocessing";

import bbox from "@turf/bbox";
// @ts-ignore
import geoblaze from "geoblaze";
import logger from "../util/logger";
import biomassStats from "../../data/precalc/biomass.json";

const precalcStats = biomassStats as BiomassPrecalc;

const SUBREGION_IDS = ["mn", "whi"] as const;
type SUBREGION_ID = typeof SUBREGION_IDS[number];

const BIOMASS_TYPES = ["browser", "grazer", "scraper"] as const;
type BIOMASS_TYPE = typeof BIOMASS_TYPES[number];

interface Subregion {
  id: SUBREGION_ID;
  name: string;
  bbox: BBox;
}

interface BiomassDatasource {
  type: BIOMASS_TYPE;
  region: SUBREGION_ID;
  /** URL of the raster file */
  url: string;
}

/** Biomass analysis result for a single biomass type and region */
interface BiomassResult {
  type: BIOMASS_TYPE;
  /** Total count of cells with high quantile value */
  region: SUBREGION_ID;
  totalCount: number;
  /** Total count of cells with high quantile value within sketch */
  sketchCount: number;
}

/** Provide strong typing for precalculated stats */
interface BiomassPrecalc {
  highQuantileCellValue: {
    [biomassType: string]: {
      [region: string]: number;
    };
  };
  cellCountByValue: {
    [biomassType: string]: {
      [region: string]: {
        [highQuantValue: string]: number;
      };
    };
  };
}

/**
 * Biomass results are an object keyed by region ID
 */
export interface BiomassResults {
  biomass: BiomassResult[];
}

// These are subregions where biomass data exist.  Analysis is run for each subregion
// that the sketch overlaps with
const subregions: Subregion[] = [
  {
    id: "mn",
    name: "Maui Nui",
    bbox: [
      -157.3371169900573534, 20.5566313585666265, -155.9621572597392003,
      21.2330457203244691,
    ],
  },
  {
    id: "whi",
    name: "West Hawaii",
    bbox: [
      -156.0741979364363203, 18.8954214781976404, -155.6606770176455257,
      20.2647321723465517,
    ],
  },
];

const datasourceUrl = "http://127.0.0.1:8080";
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
    type: "grazer",
    region: "whi",
    url: `${datasourceUrl}/scraper_biomass_whi.tif`,
  },
];

/**
 * Calculates biomass stats within Feature polygons for given single band raster
 */
export async function biomassCountByValue(
  type: BIOMASS_TYPE,
  region: SUBREGION_ID,
  /** High quant cell value to filter for */
  value: number,
  /** Polygons to filter for */
  features: Feature<Polygon>[],
  raster: object
): Promise<BiomassResult> {
  // Count cells with high quant value in every polygon
  const sketchCount = (
    await Promise.all(
      features.map(async (feature) => {
        // @ts-ignore
        const binaryRaster = await geoblaze.rasterCalculator(
          raster,
          (a: any) => (a === value ? 1 : 0) // Make high quant value cells 1, all others 0
        );
        // @ts-ignore
        const count = await geoblaze.sum(binaryRaster, feature)[0]; // Sum of binary is effectively a count
        return count as number;
      })
    )
  ).reduce((sum, sketchCount) => {
    return sketchCount + sum;
  }, 0);

  return {
    type,
    region,
    totalCount: precalcStats.cellCountByValue[type][region][value],
    sketchCount,
  };
}

export async function biomass(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<BiomassResults> {
  try {
    const sketches = toSketchArray(sketch);

    // Find subregions that overlap sketch and get just their ID
    const overlappingRegions = subregions
      .map((region) => bboxOverlap(region.bbox, sketch.bbox || bbox(sketch)))
      .reduce<Subregion["id"][]>(
        (overlapIds, isOverlap, index) =>
          isOverlap ? overlapIds.concat([subregions[index].id]) : overlapIds,
        []
      );

    // Load and calculate sum offor each raster independently (async)
    let biomassRuns: Promise<BiomassResult>[] = [];
    overlappingRegions.forEach((region) => {
      BIOMASS_TYPES.forEach(async (type) => {
        const datasource = biomassDatasources.find(
          (d) => d.region === region && d.type === type
        );
        if (!datasource) throw new Error("could not find matching datasource");
        const raster = await loadRaster(datasource.url);
        const highQuantValue = biomassStats.highQuantileCellValue[type][region];
        const run = biomassCountByValue(
          type,
          region,
          highQuantValue,
          sketches,
          raster
        );
        biomassRuns.push(run);
      });
    });
    const results = await Promise.all(biomassRuns);

    return {
      biomass: results,
    };
  } catch (err) {
    logger.error("biomass error", err);
    throw new Error(err);
  }
}

async function loadRaster(url: string): Promise<object> {
  return geoblaze.load(url);
}

export default new GeoprocessingHandler(biomass, {
  title: "biomass",
  description: "calculates biomass within given sketch",
  timeout: 2, // seconds
  memory: 2048, // megabytes
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
