import { keyBy } from "@seasketch/geoprocessing/dist/src/helpers";

/** Regions defined within project */
const REGION_IDS = ["mn", "whi"] as const;
export type REGION_ID = typeof REGION_IDS[number];

/** Region within a project */
export interface Region {
  id: string;
  name: string;
  bbox: [number, number, number, number];
}

/** Region definitions for project */
export const regions: Region[] = [
  {
    id: "mn",
    name: "Maui Nui",
    bbox: [
      -157.3371169900573534,
      20.5566313585666265,
      -155.9621572597392003,
      21.2330457203244691,
    ],
  },
  {
    id: "whi",
    name: "West Hawaii",
    bbox: [
      -156.0741979364363203,
      18.8954214781976404,
      -155.6606770176455257,
      20.2647321723465517,
    ],
  },
];

export const regionsById = keyBy(regions, (region) => region.id);
