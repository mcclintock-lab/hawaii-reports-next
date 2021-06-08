import area from "@turf/area";
import { FeatureCollection, Polygon, Feature } from "@seasketch/geoprocessing";
import { strict as assert } from "assert";

/**
 * Calculates area stats for a given feature collection.
 * @param {} collection - a GeoJSON feature collection
 * @param {*} typeProperty - feature property to stratify by
 */
export function calcAreaStats(
  collection: FeatureCollection<Polygon>,
  typeProperty: string
) {
  // Sum area by type, single pass
  const areaByType = collection.features.reduce<{ [key: string]: number }>(
    (progress, feat) => {
      const featArea = area(feat);
      if (!feat || !feat.properties) return progress;
      return {
        ...progress,
        [feat.properties[typeProperty]]:
          feat.properties[typeProperty] in progress
            ? progress[feat.properties[typeProperty]] + featArea
            : featArea,
      };
    },
    {}
  );

  const featByType = collection.features.reduce<{
    [key: string]: Feature<Polygon>[];
  }>((progress, feat) => {
    if (!feat || !feat.properties) return progress;
    return {
      ...progress,
      [feat.properties[typeProperty]]:
        feat.properties[typeProperty] in progress
          ? progress[feat.properties[typeProperty]].concat(feat)
          : [feat],
    };
  }, {});

  // Sum total area
  const totalArea = Object.values(areaByType).reduce(
    (sum, val) => sum + val,
    0
  );

  // Calculate percentage area by type
  const areaStatsByType = Object.keys(areaByType).map((type) => {
    assert(areaByType[type] >= 0 && areaByType[type] <= totalArea);
    return {
      [typeProperty]: type,
      totalArea: areaByType[type],
      percArea: areaByType[type] / totalArea,
    };
  });

  assert(totalArea && totalArea > 0);

  return {
    totalArea,
    areaByType: areaStatsByType,
    areaUnit: "square meters",
  };
}
