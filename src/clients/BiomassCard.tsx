import React from "react";
import { ResultsCard } from "@seasketch/geoprocessing/client";
import { BiomassResults, regions, regionsById } from "../functions/biomass";
import groupBy from "lodash.groupby";

// const STUDY_REGION_AREA_SQ_KM = STUDY_REGION_AREA_SQ_METERS / 1000;

const Number = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumFractionDigits: 1,
});
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

      const biomassByRegion = groupBy(data.biomass, "region");

      return (
        <>
          <p>
            Your zone protects the the following percent of high biomass areas
            for browsers, grazers, and scrapers. High biomass areas were those
            in which predicted biomass of the respective functional group of
            herbivores was found to be in the top 25% of biomass values across
            the study region.
          </p>

          {Object.keys(biomassByRegion).map((regionId) => (
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
