import React from "react";
import {
  ResultsCard,
  LayerToggle,
  squareMeterToKilometer,
  Table,
  Column,
} from "@seasketch/geoprocessing/client";
import { TYPE_FIELD, islands } from "../functions/contourConstants";
import { KeySection } from "../components/KeySection";

// Import type definitions from function
import { ContourResults, ContourAreaStats } from "../functions/contour";

const Number = new Intl.NumberFormat("en", { style: "decimal" });
const Percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 2,
});

const ContourCard = () => (
  <ResultsCard title="Nearshore" functionName="contour">
    {(data: ContourResults) => {
      const areaUnitDisplay = "sq. km";

      const columns: Column<ContourAreaStats>[] = [
        {
          Header: "Island",
          accessor: (row) => islands.find((i) => i.id === row.Island)?.label,
          style: { backgroundColor: "#efefef", fontSize: 14 },
        },
        {
          Header: `Area (${areaUnitDisplay})`,
          style: { textAlign: "center", fontSize: 14 },
          accessor: (row) => {
            const num = Number.format(squareMeterToKilometer(row.sketchArea));
            return num === "0" ? "-" : num;
          },
        },
        {
          Header: "Area (% of total)",
          style: { textAlign: "center", fontSize: 14 },
          accessor: (row) => {
            const num = Percent.format(row.sketchArea / row.totalArea);
            return num === "0%" ? "-" : num;
          },
        },
      ];

      const percSketchContourDisplay = Percent.format(
        data.percSketchInContourArea
      );
      return (
        <>
          <p>
            Marine management areas should be limited to the nearshore within 50
            meters of water and distributed evenly between island groups as much
            as possible.
          </p>

          <KeySection>
            <p>
              <b>{percSketchContourDisplay}</b> of the plan is within the 50
              meter contour
            </p>

            {data.areaByType.length ? (
              <Table
                columns={columns}
                data={data.areaByType.sort((a, b) =>
                  a[TYPE_FIELD].localeCompare(b[TYPE_FIELD])
                )}
              />
            ) : (
              <span>This sketch does not overlap with any habitat</span>
            )}
          </KeySection>

          <p>
            <LayerToggle
              layerId={"5e98c96635bdb2a5068611dd"}
              label="Show 50m Contour Layer"
            />
          </p>
        </>
      );
    }}
  </ResultsCard>
);

export default ContourCard;
