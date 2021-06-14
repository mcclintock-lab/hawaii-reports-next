# Fishing

## Datasets
`1_MHI_Boat_Spear_hrs` - Non-commercial Boat-based Spear Fishing Effort (hours) - (Estimated Average Annual Effort for Reef fish)

`2_MHI_Shore_Spear_hrs` - Non-commercial Shore-based Spear Fishing Effort (hours) - (Estimated Average Annual Effort for Reef fish)

`3_MHI_Biomass_Present` - predicted mean biomass (grams per square meter) of targeted reef fish species in the main Hawaiian Islands

`4_MHI_Biomass_NoFishing` - predicted mean targeted reef-fish biomass (grams per square meter) with fishing pressure set to zero

`5_MHI_Length_Present` - predicted mean length (cm) of targeted reef fish species for the main Hawaiian Islands

`6_MHI_Length_NoFishing` - predicted mean length (cm) of targeted reef fish species with fishing pressure set to zero for the main Hawaiian Islands

`7_MHI_Biomass_Increase_NoFishing` - expected difference in average biomass (grams per square meter) of targeted reef fish under current modeled fishing pressure compared to if fishing pressure were to be removed for the main Hawaiian Islands

This dataset is the result of a raster calculation where predictions of current average targeted reef fish biomass (g/m^2) by grid cell (60x60m) was subtracted from predictions of average targeted reef fish length if fishing pressure were to be removed. Fishing pressure was modeled as fishing effort hours based on accessibility to fishers. Targeted reef fish length was modeled using boosted regression trees based on fishing pressure, habitat variables, and wave power.

`8_MHI_Length_Increase_NoFishing` - expected difference in average length (cm) of targeted reef fish under current modeled fishing pressure compared to if fishing pressure were to be removed for the main Hawaiian Islands

This dataset is the result of a raster calculation where predictions of current average targeted reef fish length (cm) by grid cell (60x60m) was subtracted from predictions of average targeted reef fish length if fishing pressure were to be removed. Fishing pressure was modeled as fishing effort hours based on accessibility to fishers. Targeted reef fish length was modeled using boosted regression trees based on fishing pressure, habitat variables, and wave power.

## Report Metrics

### Length

Average length increase (cm) in sketch
* mean(8_MHI_Length_Increase_NoFishing cells in sketch polygon/s)

Average % length increase in sketch
* mean(8_MHI_Length_Increase_NoFishing / 5_MHI_Length_Present) * 100

### Biomass

Total biomass increase (g/m^2) in sketch
* sum(7_MHI_Biomass_Increase_NoFishing cells in sketch polygon/s) * 60

Average % biomass increase in sketch
* mean(7_MHI_Biomass_Increase_NoFishing / 3_MHI_Biomass_Present) * 100