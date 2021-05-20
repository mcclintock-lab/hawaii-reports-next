import {
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
  Feature,
  Polygon,
  VectorDataSource,
  isSketch,
  bboxOverlap,
} from "@seasketch/geoprocessing";
import overlap from "@turf/boolean-overlap";
import bbox from "@turf/bbox";

type MpaFeature = Feature<Polygon, { gid: number; Site_Label: string }>;

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
  const sketches = isSketch(sketch) ? [sketch] : sketch.features;
  // For each sketch, get overlapping
  let overlapNames: string[] = [];
  sketches.forEach((s) => {
    mpas.forEach((m) => {
      if (!overlapNames.includes(m.properties.Site_Label) && overlap(s, m)) {
        overlapNames.push(m.properties.Site_Label);
      }
    });
  });

  return {
    mpas: overlapNames,
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
