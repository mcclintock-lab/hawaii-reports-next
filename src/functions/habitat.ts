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
import { featureCollection as fc } from "@turf/helpers";
import { HAB_TYPE_FIELD } from "./habitatConstants";

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
  /** Total area within sketch with this habitat type */
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
  sketch: Feature<Polygon> | FeatureCollection<Polygon>
): Promise<HabitatResults> {
  const habFeatures = await habSource.fetch(sketch.bbox || bbox(sketch));

  // Dissolve down to a single sketch feature for speed
  const sketchFC = isFeatureCollection(sketch)
    ? dissolve(sketch)
    : fc([sketch]);
  const sketchMulti = (combine(sketchFC) as FeatureCollection<Polygon>)
    .features[0];

  // Intersect habitat polys one at a time with dissolved sketch, maintaining habitat properties
  const clippedHabFeatures = habFeatures.reduce<HabitatFeature[]>((acc, hf) => {
    const polyClipped = intersect(hf, sketchMulti, {
      properties: hf.properties,
    }) as HabitatFeature;
    return polyClipped ? acc.concat(polyClipped) : acc;
  }, []);

  // Sum total area by hab type within sketch in square meters
  const sumAreaByHabType = clippedHabFeatures.reduce<{ [key: string]: number }>(
    (acc, poly) => {
      const polyArea = area(poly);
      return {
        ...acc,
        [poly.properties[HAB_TYPE_FIELD]]: acc.hasOwnProperty(
          poly.properties[HAB_TYPE_FIELD]
        )
          ? acc[poly.properties[HAB_TYPE_FIELD]] + polyArea
          : polyArea,
      };
    },
    {}
  );

  // Flatten into array response
  return {
    ...habitatAreaStats,
    areaByType: habitatAreaStats.areaByType.map((abt) => ({
      ...abt,
      sketchArea: sumAreaByHabType[abt[HAB_TYPE_FIELD]] || 0,
    })),
  };
}

export default new GeoprocessingHandler(habitat, {
  title: "habitat",
  description: "Calculate habitat within sketch",
  timeout: 2, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
