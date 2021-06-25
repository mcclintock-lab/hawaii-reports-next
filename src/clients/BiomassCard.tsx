import React from "react";
import { ResultsCard, groupBy } from "@seasketch/geoprocessing/client";
import { BiomassResults } from "../functions/biomass";
import { regions, regionsById, REGION_ID } from "../region";

const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

const BiomassCard = () => (
  <ResultsCard title="Biomass" functionName="biomass">
    {(data: BiomassResults) => {
      if (data.biomass.length === 0) {
        return (
          <>
            <p>
              <b>No Data.</b>
            </p>
            <p>
              Sketch is not within one of the subregions: ${regions.join(", ")}
            </p>
          </>
        );
      }

      const biomassByRegion = groupBy(data.biomass, (br) => br.region); //as Record<REGION_ID, BiomassResult[]>;
      const resultRegions = Object.keys(biomassByRegion) as REGION_ID[];
      return (
        <>
          <p>
            Your zone protects a percentage of high biomass areas for 3 groups
            of herbivores: browsers, grazers, and scrapers.
          </p>
          <p>
            High biomass areas are those in which the predicted biomass of the
            group is in the top 25% across the study region.
          </p>

          {resultRegions.map((regionId) => (
            <>
              <h4>{regionsById[regionId].name}</h4>
              {biomassByRegion[regionId].map((result) => (
                <p>
                  {result.type} -{" "}
                  {Percent.format(result.sketchCount / result.totalCount)}
                </p>
              ))}
            </>
          ))}
        </>
      );
    }}
  </ResultsCard>
);

export default BiomassCard;
