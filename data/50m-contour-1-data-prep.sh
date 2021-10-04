#!/bin/bash
# Run in workspace

SRC_DATASET=src/50m_contour/50m_contour.fgb
DIST_DATASET=dist/50m_contour_poly.fgb

if [ ! -f "$SRC_DATASET" ]; then
  echo 'Missing src dataset'
  exit 0
fi

rm -rf $DIST_DATASET
ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -explodecollections $DIST_DATASET $SRC_DATASET

# Then manually use QGIS "Join attributes by nearest" with Coastline polys to join island id and label