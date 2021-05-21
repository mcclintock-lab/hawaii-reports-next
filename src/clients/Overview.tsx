import React from "react";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client";
import MinWidthCard from "./MinWidthCard";
import SizeCard from "./SizeCard";
import OverlapMpaCard from "./OverlapMpaCard";

const Overview = () => {
  return (
    <>
      <MinWidthCard />
      <SizeCard />
      <OverlapMpaCard />
      <SketchAttributesCard autoHide={true} />
    </>
  );
};

export default Overview;
