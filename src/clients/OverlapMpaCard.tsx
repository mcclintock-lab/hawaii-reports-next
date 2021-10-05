import React from "react";
import {
  ResultsCard,
  Table,
  Column,
  KeySection,
} from "@seasketch/geoprocessing/client";

// Import type definitions from function
import { OverlapMpaResults } from "../functions/overlapMpa";

const OverlapCard = () => (
  <ResultsCard title="Overlap" functionName="overlapMpa">
    {(data: OverlapMpaResults) => {
      const columns: Column[] = [
        {
          Header: "Overlapping Protected Areas",
          accessor: "mpaName",
          style: { backgroundColor: "#efefef" },
        },
      ];
      return (
        <>
          <p>
            It is important to consider existing protected areas when planning
            new Marine managment areas.
          </p>

          <KeySection>
            {data.mpas.length ? (
              <Table
                columns={columns}
                data={data.mpas.map((mpaName) => ({ mpaName }))}
              />
            ) : (
              <span>This sketch does not overlap with any protected areas</span>
            )}
          </KeySection>
        </>
      );
    }}
  </ResultsCard>
);

export default OverlapCard;
