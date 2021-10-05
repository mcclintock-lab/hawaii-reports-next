import React from "react";
import {
  ResultsCard,
  groupBy,
  Column,
  Table,
  capitalize,
  KeySection,
} from "@seasketch/geoprocessing/client";
import { BiomassResult, BiomassResults } from "../functions/biomass";
import { regions, regionsById, REGION_ID } from "../region";

const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

const BiomassCard = () => (
  <ResultsCard title="Biomass" functionName="biomass">
    {(data: BiomassResults) => {
      const biomassByRegion = groupBy(data.biomass, (br) => br.region); //as Record<REGION_ID, BiomassResult[]>;
      const resultRegions = Object.keys(biomassByRegion) as REGION_ID[];

      const columns: Column<BiomassResult>[] = [
        {
          Header: "Region",
          accessor: (row) => regionsById[row.region].name,
          style: { backgroundColor: "#efefef", fontSize: 14 },
        },
        {
          Header: "Herbivore Group",
          accessor: (row) => capitalize(row.type),
          style: { backgroundColor: "#efefef", fontSize: 14 },
        },
        {
          Header: "% of high biomass",
          style: { textAlign: "center", fontSize: 14 },
          accessor: (row) => {
            const num = Percent.format(row.sketchCount / row.totalCount);
            return num === "0%" ? "-" : num;
          },
        },
      ];

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
          <KeySection>
            {data.biomass.length ? (
              <Table
                columns={columns}
                data={data.biomass.sort((a, b) =>
                  a.region.localeCompare(b.region)
                )}
              />
            ) : (
              <span>
                Sketch is not within one of the defined subregions:{" "}
                {regions.map((r) => r.name).join(", ")}
              </span>
            )}
          </KeySection>
        </>
      );
    }}
  </ResultsCard>
);

export default BiomassCard;
