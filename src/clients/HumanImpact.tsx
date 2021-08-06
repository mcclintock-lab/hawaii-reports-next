import React, { FunctionComponent } from "react";
import FishRecoveryCard from "./FishRecoveryCard";
import HumanImpactCard from "./HumanImpactCard";

interface ReportProps {
  hidden: boolean;
}

const HumanImpact: FunctionComponent<ReportProps> = ({ hidden }) => {
  return (
    <div style={{ display: hidden ? "none" : "block" }}>
      <FishRecoveryCard />
      <HumanImpactCard />
    </div>
  );
};

export default HumanImpact;
