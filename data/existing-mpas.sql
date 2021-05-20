BEGIN;
DROP TABLE IF EXISTS existing_mpas_final;

-- Create new table for subdivided polygons
-- union field is kept to allow customization of use/behavior per union boundary
CREATE TABLE existing_mpas_final (
  gid serial PRIMARY KEY,
  geom geometry(Polygon, 4326),
  "Site_Label" text NOT NULL
);

-- expand multipolygons into polygons, since sketch is a polygon and @turf/boolean-overlap requires same geom type for check
INSERT INTO existing_mpas_final (geom, "Site_Label")
SELECT
  geom,
  "Site_Label"
FROM (
  SELECT
    (st_dump(geom)).geom AS geom,
    gid,
    "Site_Label"
  FROM
    existing_mpas
) AS existing_mpas_final;

COMMIT;

CREATE INDEX ON existing_mpas_final USING gist(geom);
