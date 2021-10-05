import React from "react";
import {
  ResultsCard,
  Table,
  Column,
  KeySection,
} from "@seasketch/geoprocessing/client";

// Import type definitions from function
import { HumanImpactResults } from "../functions/humanImpact";

const HumanImpactCard = () => (
  <ResultsCard title="Human Impact" functionName="humanImpact">
    {(data: HumanImpactResults) => {
      const columns: Column[] = [
        {
          Header: "High impacts found",
          accessor: "name",
          style: { backgroundColor: "#efefef" },
        },
      ];
      return (
        <>
          <p>
            It is important to consider human impacts when siting MMAs. Marine
            ecosystems can be degraded by human impacts that decrease ecosystem
            health, productivity and resilience to climate change, adversely
            affect many species, and severely undermine the long-term
            sustainability of marine resources and the ecosystem services they
            provide. These impacts include Coastal Modification, Urban Runoff
            (from Impervious Surfaces), Nearshore Sediment Runoff, Effluent,
            Nitrogen, and Phosophorous from Cesspools and Septic Systems, and
            Agriculture and Golf Course Runoff.
          </p>
          <p>
            Each of these human impacts have been classified into quantiles of
            low, medium, and high values representing the bottom, middle, and
            top third of the value ranges for each impact.
          </p>

          <KeySection>
            {data.impacts.length ? (
              <Table
                columns={columns}
                data={data.impacts.map((name) => ({ name }))}
              />
            ) : (
              <span>
                This sketch does not overlap with any high human impacts
              </span>
            )}
          </KeySection>
        </>
      );
    }}
  </ResultsCard>
);

export default HumanImpactCard;
