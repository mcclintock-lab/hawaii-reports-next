#!/bin/bash
# Insert into final table, expanding geometries from multi into single

echo "expanding ${TABLE_NAME_FINAL}"
psql -t <<SQL
  INSERT INTO ${TABLE_NAME_FINAL}
  SELECT *
  FROM (
    SELECT
      ${COLUMNS_MINUS_GEOM},
      (st_dump(geom)).geom AS geom
    FROM
      $TABLE_NAME
  ) AS ${TABLE_NAME_FINAL};
SQL