import React from "react";
import {
  ResultsCard,
  squareMeterToKilometer,
  LayerToggle,
} from "@seasketch/geoprocessing/client";
import { STUDY_REGION_AREA_SQ_METERS } from "../functions/areaConstants";
import { KeySection } from "../components/KeySection";

// Import type definitions from function
import { AreaResults } from "../functions/area";

const Number = new Intl.NumberFormat("en", { style: "decimal" });
const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 2,
});

const SizeCard = () => (
  <ResultsCard title="Size" functionName="area">
    {(data: AreaResults) => {
      const areaDisplay = Number.format(
        Math.round(squareMeterToKilometer(data.area))
      );
      const percArea = data.area / STUDY_REGION_AREA_SQ_METERS;
      const percDisplay = Percent.format(percArea);
      const areaUnitDisplay = "sq. km";

      return (
        <>
          <p>
            Marine management areas must be large enough to sustain focal
            species within their boundaries during their adult and juvenile life
            history phases. Different species move different distances as adults
            and juveniles, so larger areas may include more species.
          </p>

          <KeySection>
            <p>
              This plan is <b>{areaDisplay}</b> {areaUnitDisplay}, which is{" "}
              <b>{percDisplay}</b> of state waters.
            </p>
          </KeySection>
          <p>
            <LayerToggle
              layerId={"5e98c93635bdb2a5068611b5"}
              label="Show State Waters Boundary Layer"
            />
          </p>
        </>
      );
    }}
  </ResultsCard>
);

export default SizeCard;
