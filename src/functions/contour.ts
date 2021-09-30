import {
  Sketch,
  SketchCollection,
  Feature,
  FeatureCollection,
  isFeatureCollection,
  Polygon,
  GeoprocessingHandler,
  sketchArea,
  deserialize,
  fgBoundingBox,
  intersect,
  toJsonFile,
} from "@seasketch/geoprocessing";
import combine from "@turf/combine";
import bbox from "@turf/bbox";
import dissolve from "@turf/dissolve";
import turfArea from "@turf/area";
import { featureCollection, MultiPolygon } from "@turf/helpers";
import { TYPE_FIELD, islands } from "./contourConstants";
import contourAreaStats from "../../data/precalc/contourAreaStats.json";
import { takeAsync } from "flatgeobuf/lib/cjs/streams/utils";
import { roundDecimal } from "../util/roundDecimal";

// 50m contour polygon
type ContourPoly = Feature<
  Polygon,
  {
    [TYPE_FIELD]: string;
    Label: string;
  }
>;

export interface ContourResults {
  /** Area of sketch */
  area: number;
  /** Total area of 50m contour */
  totalArea: number;
  /** Unit of measurement for area value */
  areaUnit: string;
  /** 50m contour area by type */
  areaByType: ContourAreaStats[];
  /** Total area of 50m contour overlapped by sketch */
  sketchContourArea: number;
  /** Percentage of contour area overlapped by sketch */
  sketchPercContourArea: number;
  /** Percentage of sketch in 50m contour area */
  percSketchInContourArea: number;
}

export interface ContourAreaStats {
  /** Total area with this type in square meters */
  totalArea: number;
  /** Percentage of overall with this type */
  percArea: number;
  /** Total area within feature with this type, rounded to the nearest meter */
  sketchArea: number;
  /** Dataset-specific field containing type name */
  [TYPE_FIELD]: string;
}

export async function contour(
  feature: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<ContourResults> {
  const featureArea = sketchArea(feature);
  const box = feature.bbox || bbox(feature);

  const filename = "50m_contour_poly.fgb";
  const url =
    process.env.NODE_ENV === "test"
      ? `http://127.0.0.1:8080/${filename}`
      : `https://gp-hawaii-reports-next-datasets.s3.us-west-1.amazonaws.com/${filename}`;
  // TODO: fetch should be done for bbox of each feature and combine, not all at once in one big bbox
  const contourPolys = (await takeAsync(
    deserialize(url, fgBoundingBox(box)) as AsyncGenerator
  )) as ContourPoly[];

  // If collection, dissolve to remove overlap
  const sketchFC = isFeatureCollection(feature)
    ? dissolve(feature)
    : featureCollection([feature]);
  const sketchMulti = (combine(sketchFC) as FeatureCollection<MultiPolygon>)
    .features[0];

  // toJsonFile(
  //   bboxPolygon(box),
  //   `contourRemain_${feature.properties.name}_Box.geojson`
  // );
  // toJsonFile(
  //   featureCollection(contourPolys),
  //   `contourRemain_${feature.properties.name}_Contours.geojson`
  // );

  // let overlapPolys: Feature<Polygon | MultiPolygon>[] = [];
  // let contourAreas: number[] = [];
  // // intersect each sketch poly with each contour poly
  // // TODO: intersect should accept list as second argument, see #92
  // sketchFC.features.forEach((sketchPoly) => {
  //   contourPolys.forEach((contourPoly) => {
  //     const overlapPoly = intersect(sketchPoly, contourPoly);
  //     if (overlapPoly) {
  //       overlapPolys.push(overlapPoly);
  //       contourAreas.push(turfArea(overlapPoly));
  //     }
  //   });
  // });

  const clippedFeatures = contourPolys.reduce<ContourPoly[]>((acc, hf) => {
    const polyClipped = intersect(hf, sketchMulti, {
      properties: hf.properties,
    }) as ContourPoly;
    return polyClipped ? acc.concat(polyClipped) : acc;
  }, []);

  // Sum total area by type within feature in square meters
  const sumAreaByType = clippedFeatures.reduce<{
    [key: string]: number;
  }>((acc, poly) => {
    const polyArea = turfArea(poly);
    return {
      ...acc,
      [poly.properties[TYPE_FIELD]]: acc.hasOwnProperty(
        poly.properties[TYPE_FIELD]
      )
        ? acc[poly.properties[TYPE_FIELD]] + polyArea
        : polyArea,
    };
  }, {});

  const areaByType = contourAreaStats.areaByType.map((abt) => ({
    ...abt,
    sketchArea: roundDecimal(sumAreaByType[abt[TYPE_FIELD]] || 0, 6),
  }));

  // if (overlapPolys.length > 0) {
  //   toJsonFile(
  //     featureCollection(overlapPolys),
  //     `contourRemain_${feature.properties.name}.geojson`
  //   );
  // }

  // Sum the areas
  const sketchContourArea = Object.values(sumAreaByType).reduce(
    (acc, sumType) => acc + sumType,
    0
  );

  return {
    area: featureArea,
    ...contourAreaStats,
    areaByType,
    sketchContourArea,
    sketchPercContourArea: sketchContourArea / contourAreaStats.totalArea,
    percSketchInContourArea: sketchContourArea / featureArea,
  };
}

export default new GeoprocessingHandler(contour, {
  title: "contour",
  description: "Calculates contour stats",
  timeout: 20, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
