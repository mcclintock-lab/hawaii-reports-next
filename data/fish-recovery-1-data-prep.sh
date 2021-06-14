#!/bin/bash
# Run in workspace

if [ ! -d src/fishing ]; then
  echo 'Missing src fishing data'
  exit 0
fi
# Cleanup dist
rm -rf dist/fishing
mkdir dist/fishing

# avg. percent biomass increase = (avg. biomass increase / avg. biomass present) * 100
gdal_calc.py --calc "(A / B) * 100" --format GTiff --type Float32 -A src/fishing/7_MHI_Biomass_Increase_NoFishing.tif --A_band 1 -B src/fishing/3_MHI_Biomass_Present.tif --B_band 1 --outfile dist/MHI_Biomass_Percent_Increase.tif
gdalwarp -t_srs EPSG:4326 dist/MHI_Biomass_Percent_Increase.tif dist/fishing/MHI_Biomass_Percent_Increase_4326.tif
rm dist/MHI_Biomass_Percent_Increase.tif

# avg. percent length increase = (avg. biomass increase / avg. biomass present) * 100
gdal_calc.py --calc "(A / B) * 100" --format GTiff --type Float32 -A src/fishing/8_MHI_Length_Increase_NoFishing.tif --A_band 1 -B src/fishing/5_MHI_Length_Present.tif --B_band 1 --outfile dist/MHI_Length_Percent_Increase.tif
gdalwarp -t_srs EPSG:4326 dist/MHI_Biomass_Percent_Increase.tif dist/fishing/MHI_Biomass_Percent_Increase_4326.tif
rm dist/MHI_Length_Percent_Increase.tif