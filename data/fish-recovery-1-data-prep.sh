#!/bin/bash
# Run in workspace

if [ ! -d src/fishRecovery ]; then
  echo 'Missing src fish recovery data'
  exit 0
fi

# avg. percent biomass increase = (avg. biomass increase / avg. biomass present) * 100
gdal_calc.py --calc "A / B" --format GTiff --type Float32 -A src/fishRecovery/7_MHI_Biomass_Increase_NoFishing.tif --A_band 1 -B src/fishRecovery/3_MHI_Biomass_Present.tif --B_band 1 --outfile dist/MHI_Biomass_Percent_Increase.tif
# Remove LZW compression
gdalwarp -t_srs EPSG:4326 dist/MHI_Length_Percent_Increase.tif dist/fishRecovery/MHI_Length_Percent_Increase_4326.tif
# Cleanup
rm dist/MHI_Length_Percent_Increase.tif

# avg. percent length increase = (avg. biomass increase / avg. biomass present) * 100
gdal_calc.py --calc "A / B" --format GTiff --type Float32 -A src/fishRecovery/8_MHI_Length_Increase_NoFishing.tif --A_band 1 -B src/fishRecovery/5_MHI_Length_Present.tif --B_band 1 --outfile dist/MHI_Length_Percent_Increase.tif
# Remove LZW compression
gdalwarp -t_srs EPSG:4326 dist/MHI_Biomass_Percent_Increase.tif dist/fishRecovery/MHI_Biomass_Percent_Increase_4326.tif
# Cleanup
rm dist/MHI_Length_Percent_Increase.tif