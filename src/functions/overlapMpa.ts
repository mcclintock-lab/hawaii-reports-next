import {
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
  Feature,
  Polygon,
  VectorDataSource,
  isSketch,
  toolbox,
} from "@seasketch/geoprocessing";
import overlap from "@turf/boolean-overlap";

const nameProperty = "Site_Label";

type MpaFeature = Feature<Polygon, { gid: number; [nameProperty]: string }>;

export interface OverlapMpaResults {
  /** Array of names of MPAs that overlap with sketch */
  mpas: string[];
}

// Defined at module level for potential caching/reuse by serverless process
const SubdividedOsmLandSource = new VectorDataSource<MpaFeature>(
  "https://dheg0ww5gbvza.cloudfront.net/"
);

export async function overlapMpa(
  sketch: Sketch | SketchCollection
): Promise<OverlapMpaResults> {
  const mpas = await SubdividedOsmLandSource.fetch(sketch.bbox);
  const overlapFeatures = await toolbox.overlap(sketch, mpas, nameProperty);

  return {
    mpas: overlapFeatures.map((f) => f.properties[nameProperty]),
  };
}

export default new GeoprocessingHandler(overlapMpa, {
  title: "overlapMpa",
  description: "Find which MPAs the sketch overlaps with",
  timeout: 2, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
