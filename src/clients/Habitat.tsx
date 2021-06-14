import React, { FunctionComponent } from "react";
import HabitatCard from "./HabitatCard";
import BiomassCard from "./BiomassCard";

interface ReportProps {
  hidden: boolean;
}

const Habitat: FunctionComponent<ReportProps> = ({ hidden }: ReportProps) => (
  <div style={{ display: hidden ? "none" : "block" }}>
    <HabitatCard />
    <BiomassCard />
  </div>
);

export default Habitat;
