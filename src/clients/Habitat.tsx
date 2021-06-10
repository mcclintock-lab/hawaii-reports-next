import React, { FunctionComponent } from "react";
import HabitatCard from "./HabitatCard";

interface ReportProps {
  hidden: boolean;
}

const Habitat: FunctionComponent<ReportProps> = ({ hidden }: ReportProps) => {
  return (
    <div style={{ display: hidden ? "none" : "block" }}>
      <HabitatCard />
    </div>
  );
};

export default Habitat;
