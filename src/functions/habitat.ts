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
}

interface AreaStats {
  totalArea: number;
  sketchArea: number;
  /** Dataset-specific field containing habitat type name */
  D_STRUCT: string;
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

  // Dissolve down to a single feature
  const sketchFC = isFeatureCollection(sketch)
    ? dissolve(sketch)
    : fc([sketch]);
  const sketchMulti = (combine(sketchFC) as FeatureCollection<Polygon>)
    .features[0];

  // Clip out habitat polys one at a time within sketch
  // Ensures re-merge of properties after with habitat name, otherwise we could have combined into multipolygon first
  const clippedHabFeatures = habFeatures.reduce<HabitatFeature[]>((acc, hf) => {
    const polyClipped = intersect(hf, sketchMulti) as Feature<Polygon>;
    return polyClipped && polyClipped.properties
      ? acc.concat({ ...polyClipped, properties: hf.properties })
      : acc;
  }, []);

  // Sum total area by hab type within sketch in sq km
  const sumAreaByHabType = clippedHabFeatures.reduce<{ [key: string]: number }>(
    (acc, poly) => {
      const polyArea = area(poly);
      return {
        ...acc,
        [poly.properties[HAB_TYPE_FIELD]]: acc.hasOwnProperty(
          poly.properties[HAB_TYPE_FIELD]
        )
          ? acc[poly.properties[HAB_TYPE_FIELD]] + polyArea
          : 0,
      };
    },
    {}
  );

  const areaPercByHabType = Object.keys(sumAreaByHabType).reduce<{
    [key: string]: number;
  }>((acc, habtype) => {
    const totalArea = habitatAreaStats.areaByType.find(
      (s) => s[HAB_TYPE_FIELD] === habtype
    )?.totalArea;
    if (!totalArea)
      throw new Error(`Total area not known for habitat type ${habtype}`);
    return {
      ...acc,
      [habtype]: sumAreaByHabType[habtype] / totalArea,
    };
  }, {});

  // Flatten into array response
  return {
    ...habitatAreaStats,
    areaByType: habitatAreaStats.areaByType.map((abt) => ({
      ...abt,
      sketchArea: areaPercByHabType[abt[HAB_TYPE_FIELD]] || 0,
    })),
  };
}

export default new GeoprocessingHandler(habitat, {
  title: "habitat",
  description: "Calculate habitat within sketch",
  timeout: 2, // seconds
  memory: 1024, // megabytes
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
