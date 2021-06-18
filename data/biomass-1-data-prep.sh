#!/bin/bash
# Run in workspace

if [ ! -d src/biomass ]; then
  echo 'Missing src biomass data'
  exit 0
fi

# Reproject and remove LZW compression
gdalwarp -t_srs EPSG:4326 src/biomass/browser_biomass_mn.tif dist/browser_biomass_mn.tif
gdalwarp -t_srs EPSG:4326 src/biomass/grazer_biomass_mn.tif dist/grazer_biomass_mn.tif
gdalwarp -t_srs EPSG:4326 src/biomass/scraper_biomass_mn.tif dist/scraper_biomass_mn.tif
gdalwarp -t_srs EPSG:4326 src/biomass/browser_biomass_whi.tif dist/browser_biomass_whi.tif
gdalwarp -t_srs EPSG:4326 src/biomass/grazer_biomass_whi.tif dist/grazer_biomass_whi.tif
gdalwarp -t_srs EPSG:4326 src/biomass/scraper_biomass_whi.tif dist/scraper_biomass_whi.tif