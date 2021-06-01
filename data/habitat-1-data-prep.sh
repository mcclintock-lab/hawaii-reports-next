#!/bin/bash
# Run in workspace

source ./habitat.env

if [ ! -d $SRC_DATASET ]; then
  echo 'Missing src dataset'
  exit 0
fi

# Clean up old data
rm -rf $DIST_DATASET

# Get package layer names
mapfile -t PKG_LAYERS < <( ogrinfo -al $SRC_DATASET | grep "Layer name:" | sed -e "s/^Layer name: //" )
NUM_START=0
NUM_END="$((${#PKG_LAYERS[@]}-1))"

# Merge layers into one
for i in $(seq ${NUM_START} ${NUM_END});
do
  PKG_LAYER_NAME=${PKG_LAYERS[$i]}
  echo "Appending $PKG_LAYER_NAME $i into $LAYER_NAME layer of $DIST_DATASET"
  ogr2ogr -t_srs "EPSG:4326" -append -nln $LAYER_NAME -f GPKG -explodecollections -dialect OGRSQL -sql "SELECT $ATTRIBS_TO_KEEP FROM $PKG_LAYER_NAME" $DIST_DATASET $SRC_DATASET
done

