#!/bin/bash
# Run in workspace

source ./habitat.env
source ./util/cleanupDb.sh

if [ ! -f ${DIST_DATASET} ]; then
  echo 'Missing dist dataset, did you run data-prep script?'
  exit 0
fi

# Load into PostGIS, creating unique gid value
ogr2ogr -overwrite -lco LAUNDER=NO -lco GEOMETRY_NAME=geom -lco FID=gid -nln $LAYER_NAME -f PostgreSQL "PG:host=${PGHOST} user=${PGUSER} dbname=${PGDATABASE} password=${PGPASSWORD}" ${DIST_DATASET}

# https://www.postgresonline.com/journal/archives/41-How-to-SELECT--ALL-EXCEPT-some-columns-in-a-table.html
COLUMNS_MINUS_GEOM_GID=(`psql -t -c "SELECT array_to_string(ARRAY(SELECT '\"' || c.column_name || '\"' FROM information_schema.columns As c WHERE table_name = 'habitat'  AND  c.column_name NOT IN('geom', 'gid')), ',');"`)

source ./util/subdivide.sh