import {
  Sketch,
  SketchCollection,
  Feature,
  FeatureCollection,
  GeoprocessingHandler,
  sketchArea,
} from "@seasketch/geoprocessing";

/**
 * Area of ocean within eez minus land in square meters. Calculated by drawing
 * sketch around hawaiian islands in original seasketch project, exporting the
 * resulting sketch, calling turf/area function on it and converting square
 * meters to square miles */
export const STUDY_REGION_AREA_SQ_METERS = 8927427519.888056;

export interface AreaResults {
  /** area of the sketch in square meters */
  area: number;
  /** Percentage of the overall planning area */
  percPlanningArea: number;
  /** Unit of measurement for area value */
  areaUnit: string;
}

export async function area(
  feature: Sketch | SketchCollection | Feature | FeatureCollection
): Promise<AreaResults> {
  const area = sketchArea(feature);
  return {
    area,
    percPlanningArea: area / STUDY_REGION_AREA_SQ_METERS,
    areaUnit: "square meters",
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
