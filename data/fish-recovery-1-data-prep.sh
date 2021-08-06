#!/bin/bash
# Run in workspace

# ArcMap prep
# Reproject to WGS84 4326 - for compat with Geoblaze, GDAL misinterpreted hotine mercator
# Was putting the result in the wrong place (southern hemisphere)
# The cell size of the original rasters are what are used in area calculations

# gdal_calc produces a runtime error, doesn't sum properly with nodata values,
# and frankly had different results so used ArcMap as below and put into src

if [ ! -d src/fishRecovery ]; then
  echo 'Missing src fish recovery data'
  exit 0
fi

rm dist/*MHI*

# set nodata from nan to -9999
gdal_calc.py -A src/fishRecovery/8_MHI_Length_Increase_NoFishing.tif --outfile=dist/8_MHI_Length_Increase_NoFishing_interm.tif --calc="nan_to_num(A, nan=-9999)" --NoDataValue=-9999
gdal_calc.py -A src/fishRecovery/7_MHI_Biomass_Increase_NoFishing.tif --outfile=dist/7_MHI_Biomass_Increase_NoFishing_interm.tif --calc="nan_to_num(A, nan=-9999)" --NoDataValue=-9999

# avg. percent length increase = (avg. biomass increase / avg. biomass present) * 100
# gdal_calc.py --co="COMPRESS=LZW" --calc "A / B" --format GTiff --type Float32 -A src/fishRecovery/8_MHI_Length_Increase_NoFishing.tif --A_band 1 -B dist/5_MHI_Length_Present.tif --B_band 1 --outfile dist/MHI_Length_Percent_Increase.tif --NoDataValue=-9999
# avg. percent biomass increase = (avg. biomass increase / avg. biomass present) * 100
#gdal_calc.py --co="COMPRESS=LZW" --calc "A / B" --format GTiff --type Float32 -A dist/7_MHI_Biomass_Increase_NoFishing.tif --A_band 1 -B dist/3_MHI_Biomass_Present.tif --B_band 1 --outfile dist/MHI_Biomass_Percent_Increase.tif --NoDataValue=-9999

# copy src straight across, ensures metadata in single TIF
gdal_translate -of GTiff src/fishRecovery/MHI_Length_Percent_Increase.tif dist/MHI_Length_Percent_Increase_interm.tif
gdal_translate -of GTiff src/fishRecovery/MHI_Biomass_Percent_Increase.tif dist/MHI_Biomass_Percent_Increase_interm.tif

# gen COGs
gdal_translate -of COG -stats dist/8_MHI_Length_Increase_NoFishing_interm.tif dist/8_MHI_Length_Increase_NoFishing_cog.tif
gdal_translate -of COG -stats dist/7_MHI_Biomass_Increase_NoFishing_interm.tif dist/7_MHI_Biomass_Increase_NoFishing_cog.tif
gdal_translate -of COG -stats dist/MHI_Biomass_Percent_Increase_interm.tif dist/MHI_Biomass_Percent_Increase_cog.tif
gdal_translate -of COG -stats dist/MHI_Length_Percent_Increase_interm.tif dist/MHI_Length_Percent_Increase_cog.tif

# clean up
rm dist/*interm*