#!/bin/bash

./50m-contour-1-data-prep.sh
./biomass-1-data-prep.sh
./existing-mpas-prep.sh
./fish-recovery-1-data-prep.sh
./habitat-1-data-prep.sh

# src data not present by default
#./eez-land-union-prep.sh
#./osm-land-prep.sh