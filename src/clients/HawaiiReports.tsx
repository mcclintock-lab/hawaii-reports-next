import React, { useState } from "react";
import SegmentControl from "../components/SegmentControl";
import Overview from "./Overview";
import Habitat from "./Habitat";
import HumanImpact from "./HumanImpact";

const enableAllTabs = false;
const HawaiiReports = () => {
  const [tab, setTab] = useState<string>("Overview");
  return (
    <>
      <div style={{ marginTop: 5 }}>
        <SegmentControl
          value={tab}
          onClick={(segment) => setTab(segment)}
          segments={["Overview", "Habitat", "Human"]}
        />
      </div>
      <Overview hidden={!enableAllTabs && tab !== "Overview"} />
      <Habitat hidden={!enableAllTabs && tab !== "Habitat"} />
      <HumanImpact hidden={!enableAllTabs && tab !== "Human"} />
    </>
  );
};

export default HawaiiReports;
