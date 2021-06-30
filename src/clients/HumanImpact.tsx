import React, { FunctionComponent } from "react";
import HumanImpactCard from "./HumanImpactCard";

interface ReportProps {
  hidden: boolean;
}

const HumanImpact: FunctionComponent<ReportProps> = ({ hidden }) => {
  return (
    <div style={{ display: hidden ? "none" : "block" }}>
      <HumanImpactCard />
    </div>
  );
};

export default HumanImpact;
