import {
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
  Feature,
  Polygon,
  VectorDataSource,
  toolbox,
  unpackSketches,
} from "@seasketch/geoprocessing";
import bbox from "@turf/bbox";

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
  const mpas = await SubdividedOsmLandSource.fetch(sketch.bbox || bbox(sketch));
  const overlapFeatures = await toolbox.overlap(
    unpackSketches(sketch),
    mpas,
    nameProperty
  );

  return {
    mpas: overlapFeatures
      .map((f) => f.properties[nameProperty])
      .sort((a, b) => a.localeCompare(b)),
  };
}

export default new GeoprocessingHandler(overlapMpa, {
  title: "overlapMpa",
  description: "Find which MPAs the sketch overlaps with",
  timeout: 60, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
});
