import {
  Sketch,
  SketchCollection,
  Feature,
  FeatureCollection,
  GeoprocessingHandler,
  sketchArea,
} from "@seasketch/geoprocessing";
import { STUDY_REGION_AREA_SQ_MI } from "./areaConstants";

export interface AreaResults {
  /** area of the sketch in square meters */
  area: number;
  /** Percentage of the overall planning area */
  percPlanningArea: number;
  /** Unit of measurement for area value */
  areaUnit: string;
}

export async function area(
  sketch: Sketch | SketchCollection | Feature | FeatureCollection
): Promise<AreaResults> {
  const area = sketchArea(sketch);
  return {
    area,
    percPlanningArea: area / STUDY_REGION_AREA_SQ_MI,
    areaUnit: "square miles",
  };
}

export default new GeoprocessingHandler(area, {
  title: "area",
  description: "Calculates area stats",
  timeout: 2, // seconds
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
