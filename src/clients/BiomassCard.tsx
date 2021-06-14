import React from "react";
import { ResultsCard } from "@seasketch/geoprocessing/client";

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
  <ResultsCard title="Habitat" functionName="habitat">
    {(data: Record<string, any>) => {
      /**
       * 3 line charts labeled Browsers, Grazer
       */
      return (
        <>
          <p>
            Your zone protects the the following percent of high biomass areas
            for browsers, grazers, and scrapers. High biomass areas were those
            in which predicted biomass of the respective functional group of
            herbivores was found to be in the top 25% of biomass values across
            the study region.
          </p>

          <p>
            Work in progress
            <h3>Browsers</h3>
            <h3>Grazers</h3>
            <h3>Scrapers</h3>
          </p>
        </>
      );
    }}
  </ResultsCard>
);

export default BiomassCard;
