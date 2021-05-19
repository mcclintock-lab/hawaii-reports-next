import React from "react";
import { SketchAttributesCard } from "@seasketch/geoprocessing/client";
import MinWidthCard from "./MinWidthCard";
import SizeCard from "./SizeCard";

const Overview = () => {
  return (
    <>
      <MinWidthCard />
      <SizeCard />
      <SketchAttributesCard autoHide={true} />
    </>
  );
};

export default Overview;
