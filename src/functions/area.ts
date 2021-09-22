import {
  Sketch,
  SketchCollection,
  Feature,
  isFeatureCollection,
  Polygon,
  GeoprocessingHandler,
  sketchArea,
  deserialize,
  fgBoundingBox,
  intersect,
  toJsonFile,
} from "@seasketch/geoprocessing";
import bbox from "@turf/bbox";
import dissolve from "@turf/dissolve";
import turfArea from "@turf/area";
import { featureCollection, MultiPolygon } from "@turf/helpers";
import { STUDY_REGION_AREA_SQ_METERS } from "../functions/areaConstants";
import { totalArea } from "../../data/precalc/contourAreaStats.json";
import { takeAsync } from "flatgeobuf/lib/cjs/streams/utils";
import bboxPolygon from "@turf/bbox-polygon";

export interface AreaResults {
  /** area of the sketch in square meters */
  area: number;
  /** Percentage of the overall planning area */
  percPlanningArea: number;
  /** Unit of measurement for area value */
  areaUnit: string;
  /** area of 50m contour overlapped */
  contourArea: number;
  /** Percentage of 50m contour area overlapped */
  percContourArea: number;
  /** Percentage of sketch in 50m contour area */
  percSketchInContourArea: number;
}

// 50m contour polygon
type ContourPoly = Feature<Polygon>;

export async function area(
  feature: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<AreaResults> {
  const area = sketchArea(feature);

  //// 50m contour overlap ////

  // let contourAreas: number[] = [];
  const box = feature.bbox || bbox(feature);
  // If collection, dissolve to remove overlap
  const sketchFC = isFeatureCollection(feature)
    ? dissolve(feature)
    : featureCollection([feature]);
  const filename = "50m_contour_poly.fgb";
  const url =
    process.env.NODE_ENV === "test"
      ? `http://127.0.0.1:8080/${filename}`
      : `https://gp-hawaii-reports-next-datasets.s3.us-west-1.amazonaws.com/${filename}`;

  // TODO: fetch should be done for bbox of each feature and combine, not all at once in one big bbox
  const contourPolys = (await takeAsync(
    deserialize(url, fgBoundingBox(box)) as AsyncGenerator
  )) as ContourPoly[];

  // toJsonFile(
  //   bboxPolygon(box),
  //   `contourRemain_${feature.properties.name}_Box.geojson`
  // );
  // toJsonFile(
  //   featureCollection(contourPolys),
  //   `contourRemain_${feature.properties.name}_Contours.geojson`
  // );

  let overlapPolys: Feature<Polygon | MultiPolygon>[] = [];
  let contourAreas: number[] = [];
  // intersect each sketch poly with each contour poly
  // TODO: intersect should accept list as second argument, see #92
  sketchFC.features.forEach((sketchPoly) => {
    contourPolys.forEach((contourPoly) => {
      const overlapPoly = intersect(sketchPoly, contourPoly);
      if (overlapPoly) {
        overlapPolys.push(overlapPoly);
        contourAreas.push(turfArea(overlapPoly));
      }
    });
  });

  // if (overlapPolys.length > 0) {
  //   toJsonFile(
  //     featureCollection(overlapPolys),
  //     `contourRemain_${feature.properties.name}.geojson`
  //   );
  // }

  const contourArea = contourAreas.reduce((sum, area) => sum + area, 0);

  return {
    area,
    percPlanningArea: area / STUDY_REGION_AREA_SQ_METERS,
    areaUnit: "square meters",
    contourArea,
    percContourArea: contourArea / totalArea,
    percSketchInContourArea: contourArea / area,
  };
}

export default new GeoprocessingHandler(area, {
  title: "area",
  description: "Calculates area stats",
  timeout: 20, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
