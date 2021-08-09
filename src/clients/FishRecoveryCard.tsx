import React from "react";
import {
  ResultsCard,
  Table,
  Column,
  roundDecimal,
} from "@seasketch/geoprocessing/client";
import styled from "styled-components";

// Import type definitions from function
import { FishRecoveryResults } from "../functions/fishRecovery";
import { KeySection } from "../components/KeySection";

const TableStyled = styled.div`
  .squeeze {
    font-size: 12px;
    td:not(:first-child),
    th:not(:first-child) {
      text-align: right;
    }
  }
`;

const Percent = new Intl.NumberFormat("en", {
  style: "percent",
});

const Card = () => (
  <ResultsCard title="Fishing Pressure" functionName="fishRecovery">
    {(data: FishRecoveryResults) => {
      const columns: Column<FishRecoveryResults["potentialBySketch"][0]>[] = [
        {
          Header: "Name",
          accessor: "sketchName",
          style: { width: "30%" },
        },
        {
          Header: "Biomass",
          style: {
            backgroundColor: "#ddd",
            textAlign: "center",
            borderRight: "2px solid #efefef",
          },
          columns: [
            {
              Header: `Total (${data.biomassUnits})`,
              accessor: (row) => {
                const prefix =
                  row.biomassIncrease && row.biomassIncrease > 0 ? "+" : "";
                const postfix =
                  row.biomassIncrease &&
                  (row.biomassIncrease > 0
                    ? " ▲"
                    : row.biomassIncrease < 0
                    ? " ▼"
                    : "  ");
                return row.biomassIncrease === undefined
                  ? "-"
                  : `${prefix}${roundDecimal(
                      row.biomassIncrease,
                      1
                    ).toLocaleString()}${postfix}`;
              },
            },
            {
              Header: "Avg",
              accessor: (row) => {
                const prefix =
                  row.avgPercBiomassIncrease && row.avgPercBiomassIncrease > 0
                    ? "+"
                    : "";
                return row.avgPercBiomassIncrease === undefined
                  ? "-"
                  : `${prefix}${Percent.format(row.avgPercBiomassIncrease)}`;
              },
            },
          ],
        },
        {
          Header: "Length",
          style: { backgroundColor: "#ddd", textAlign: "center" },
          columns: [
            {
              Header: `Avg (${data.lengthUnits})`,
              accessor: (row) => {
                const prefix =
                  row.avgLengthIncrease && row.avgLengthIncrease > 0 ? "+" : "";
                const postfix =
                  row.avgLengthIncrease &&
                  (row.avgLengthIncrease > 0
                    ? " ▲"
                    : row.avgLengthIncrease < 0
                    ? " ▼"
                    : "  ");
                return row.avgLengthIncrease === undefined
                  ? "-"
                  : `${prefix}${roundDecimal(
                      row.avgLengthIncrease,
                      1
                    )}${postfix}`;
              },
            },
            {
              Header: "Avg %",
              accessor: (row) => {
                const prefix =
                  row.avgPercLengthIncrease && row.avgPercLengthIncrease > 0
                    ? "+"
                    : "";
                return row.avgPercLengthIncrease === undefined
                  ? "-"
                  : `${prefix}${Percent.format(row.avgPercLengthIncrease)}`;
              },
            },
          ],
        },
      ];

      const rows =
        data.potentialBySketch.length > 1
          ? [...data.potentialBySketch, data.potential]
          : data.potentialBySketch;

      return (
        <>
          <p>
            Changing the allowed uses within a zone can affect the size and
            abundance of reef fish within it.
          </p>
          <p>
            This analysis predicts the change in size and abundance of targeted
            reef fish within your zones, should all fishing pressure be removed.
          </p>

          <KeySection>
            {data.potentialBySketch ? (
              <TableStyled>
                <Table columns={columns} data={rows} className="squeeze" />
              </TableStyled>
            ) : (
              <span>
                This sketch does not overlap with any areas with reef fish
              </span>
            )}
          </KeySection>
        </>
      );
    }}
  </ResultsCard>
);

export default Card;
