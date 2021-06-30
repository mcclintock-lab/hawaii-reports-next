import {
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
} from "@seasketch/geoprocessing";

export interface HumanImpactResults {
  /** Array of names of MPAs that overlap with sketch */
  impacts: string[];
}

export async function humanImpact(
  sketch: Sketch | SketchCollection
): Promise<HumanImpactResults> {
  return {
    impacts: ["Not yet implemented"],
  };
}

export default new GeoprocessingHandler(humanImpact, {
  title: "humanImpact",
  description: "Find high value human impacts the sketch overlaps with",
  timeout: 10, // seconds
  executionMode: "sync",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
