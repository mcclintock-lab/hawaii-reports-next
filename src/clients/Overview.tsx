import React, { FunctionComponent } from "react";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client";
import MinWidthCard from "./MinWidthCard";
import SizeCard from "./SizeCard";
import ContourCard from "./ContourCard";
import OverlapMpaCard from "./OverlapMpaCard";

interface ReportProps {
  hidden: boolean;
}

const Overview: FunctionComponent<ReportProps> = ({ hidden }) => {
  return (
    <div style={{ display: hidden ? "none" : "block" }}>
      <ContourCard />
      <MinWidthCard />
      <OverlapMpaCard />
      <SketchAttributesCard autoHide={true} />
    </div>
  );
};

export default Overview;
