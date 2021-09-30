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
  <ResultsCard title="Nearshore Focus" functionName="contour">
    {(data: ContourResults) => {
      const areaDisplay = Number.format(
        Math.round(squareMeterToKilometer(data.area))
      );
      const areaUnitDisplay = "square kilometers";

      const columns: Column<ContourAreaStats>[] = [
        {
          Header: "Island",
          accessor: (row) => islands.find((i) => i.id === row.Island)?.label,
          style: { backgroundColor: "#efefef", fontSize: 14 },
        },
        // {
        //   Header: `Area (${areaUnitDisplay})`,
        //   style: { textAlign: "center", fontSize: 14 },
        //   accessor: (row) => {
        //     const num = Number.format(squareMeterToKilometer(row.sketchArea));
        //     return num === "0" ? "-" : num;
        //   },
        // },
        {
          Header: "% of plan within islands 50-meter depth",
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

      let lastIsland = "";
      let lastPercent = "";
      const numIslands = data.areaByType.reduce((acc, abt) => {
        if (abt.sketchArea <= 0) return acc;
        lastIsland = islands.find((i) => i.id === abt.Island)?.label || "";
        lastPercent = Percent.format(abt.sketchArea / abt.totalArea);
        return acc + 1;
      }, 0);

      return (
        <>
          <p>
            Holomua: Marine 30x30 is focusing on nearshore ecosystems,
            prioritizing management within a depth of 50-meters (164 feet).
          </p>

          <KeySection>
            <div>
              📐 This plan is{" "}
              <b>
                {areaDisplay} {areaUnitDisplay}
              </b>{" "}
              in size.
            </div>
            <div>
              {numIslands === 1 && (
                <>
                  It contains <b>{lastPercent}</b> of {lastIsland} waters within
                  50-meter depth
                </>
              )}
              {numIslands > 1 && (
                <>
                  It contains waters within 50-meter depth around multiple
                  islands:
                </>
              )}
            </div>
            {numIslands > 1 && (
              <>
                <Table
                  columns={columns}
                  data={data.areaByType.sort((a, b) =>
                    a[TYPE_FIELD].localeCompare(b[TYPE_FIELD])
                  )}
                />
              </>
            )}
            {numIslands === 0 && (
              <p>
                It contains <b>no area</b> within a depth of 50-meters
              </p>
            )}
          </KeySection>

          <p>
            <LayerToggle
              layerId={"5e98c96635bdb2a5068611dd"}
              label="Show 50m Depth Contour Line"
            />
          </p>
        </>
      );
    }}
  </ResultsCard>
);

export default ContourCard;
