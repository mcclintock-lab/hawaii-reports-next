import {
  GeoprocessingHandler,
  VectorDataSource,
  intersect,
  isFeatureCollection,
  Polygon,
  MultiPolygon,
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

  // Dissolve down to a single feature for speed
  const fc = isFeatureCollection(feature)
    ? dissolve(feature)
    : featureCollection([feature]);
  const sketchMulti = (combine(fc) as FeatureCollection<MultiPolygon>)
    .features[0];

  // Intersect sketchMulti with habFeatures[] (lose properties)
  // Group habFeatures by type, then intersect(sketchMulti, habFeaturesType)

  // Intersect habitat polys one at a time with dissolved feature, maintaining habitat properties
  try {
    // Group habFeatures by type
    const habFeaturesByType = habFeatures.reduce<
      Record<string, HabitatFeature[]>
    >((acc, hf) => {
      const htf = hf.properties[HAB_TYPE_FIELD];
      return { ...acc, [htf]: acc[htf] ? acc[htf].concat(hf) : [hf] };
    }, {});

    // Bulk intersect each group
    let sumAreaByHabType: Record<string, number> = {};
    Object.keys(habFeaturesByType).map((hft) => {
      const clippedMultipoly = intersect(sketchMulti, habFeaturesByType[hft]);
      if (clippedMultipoly) sumAreaByHabType[hft] = area(clippedMultipoly);
    });

    // Flatten into array response
    return {
      ...habitatAreaStats,
      areaByType: habitatAreaStats.areaByType.map((abt) => ({
        ...abt,
        sketchArea: roundDecimal(sumAreaByHabType[abt[HAB_TYPE_FIELD]] || 0, 6),
      })),
    };
  } catch (err) {
    logger.error("habitat error", err);
    throw new Error(err);
  }
}

export default new GeoprocessingHandler(habitat, {
  title: "habitat",
  description: "Calculate habitat within feature",
  timeout: 120, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
