import {
  GeoprocessingHandler,
  VectorDataSource,
  intersect,
  isFeatureCollection,
  Polygon,
  Feature,
  FeatureCollection,
} from "@seasketch/geoprocessing";

import area from "@turf/area";
import bbox from "@turf/bbox";
import combine from "@turf/combine";
import dissolve from "@turf/dissolve";
import { featureCollection } from "@turf/helpers";
import { HAB_TYPE_FIELD } from "./habitatConstants";
import logger from "../util/logger";
import { roundDecimal } from "../util/roundDecimal";

// Must be generated first
import habitatAreaStats from "../../data/precalc/habitatAreaStats.json";

type HabitatFeature = Feature<
  Polygon,
  {
    /** Dataset-specific attribute containing habitat type name */
    [HAB_TYPE_FIELD]: string;
    /** Unique ID added to all bundled features */
    gid: number;
  }
>;

export interface HabitatResults {
  totalArea: number;
  areaByType: AreaStats[];
  areaUnit: string;
}

export interface AreaStats {
  /** Total area with this habitat type in square meters */
  totalArea: number;
  /** Percentage of overall habitat with this habitat type */
  percArea: number;
  /** Total area within feature with this habitat type, rounded to the nearest meter */
  sketchArea: number;
  /** Dataset-specific field containing habitat type name */
  [HAB_TYPE_FIELD]: string;
}

const habSource = new VectorDataSource<HabitatFeature>(
  "https://dz7gfdehs0tj2.cloudfront.net"
);

/**
 * Returns the area captured by the Feature polygon(s)
 */
async function habitat(
  feature: Feature<Polygon> | FeatureCollection<Polygon>
): Promise<HabitatResults> {
  const box = feature.bbox || bbox(feature);
  const habFeatures = await habSource.fetch(box);
  logger.info(
    `habitat - fetched ${habFeatures.length} features within ${JSON.stringify(
      box
    )}`
  );

  // Dissolve down to a single feature feature for speed
  const fc = isFeatureCollection(feature)
    ? dissolve(feature)
    : featureCollection([feature]);
  const sketchMulti = (combine(fc) as FeatureCollection<Polygon>).features[0];

  // Intersect habitat polys one at a time with dissolved feature, maintaining habitat properties
  try {
    logger.time(`habitat - intersect time`);
    const clippedHabFeatures = habFeatures.reduce<HabitatFeature[]>(
      (acc, hf) => {
        const polyClipped = intersect(hf, sketchMulti, {
          properties: hf.properties,
        }) as HabitatFeature;
        return polyClipped ? acc.concat(polyClipped) : acc;
      },
      []
    );
    logger.timeEnd(`habitat - intersect time`);

    // Sum total area by hab type within feature in square meters
    const sumAreaByHabType = clippedHabFeatures.reduce<{
      [key: string]: number;
    }>((acc, poly) => {
      const polyArea = area(poly);
      return {
        ...acc,
        [poly.properties[HAB_TYPE_FIELD]]: acc.hasOwnProperty(
          poly.properties[HAB_TYPE_FIELD]
        )
          ? acc[poly.properties[HAB_TYPE_FIELD]] + polyArea
          : polyArea,
      };
    }, {});

    // Flatten into array response
    return {
      ...habitatAreaStats,
      areaByType: habitatAreaStats.areaByType.map((abt) => ({
        ...abt,
        sketchArea: roundDecimal(sumAreaByHabType[abt[HAB_TYPE_FIELD]] || 0, 6),
      })),
    };
  } catch (err) {
    logger.error("habitat - fail", err);
    throw new Error(err);
  }
}

export default new GeoprocessingHandler(habitat, {
  title: "habitat",
  description: "Calculate habitat within feature",
  timeout: 60, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
