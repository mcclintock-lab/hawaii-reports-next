# Hawaii Reports for Seasketch Next

## Quickstart

* npm run `start:data` - serves data/dist on localhost port 8080
* npm run `test` - run unit and smoke test suites
* npm run `test:unit` - run unit test suite
* npm run `test:smoke` - run smoke test suite

## Project Design

## Clip Preprocessor

* Uses global land and eez datasets for `clipToOcean` preprocessor

## Biomass

### Notes
* * biomass.json precalculated values were taken from the previous Biomass.pyt toolbox rather than creating them from scratch.

### Metrics
Calculate the % of high biomass areas for browsers, grazers, and scrapers.

High biomass area those in which predicted biomass of the respective functional group of herbivores was found to be in the top 25% of biomass values across the study region

## Fish Recovery

### Datasets
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

### Report Metrics

Total biomass per length increase (grams / meter) in sketch
* sum(7_MHI_Biomass_Increase_NoFishing cells in sketch polygon/s) * 60

Average % biomass increase in sketch
* mean(7_MHI_Biomass_Increase_NoFishing / 3_MHI_Biomass_Present) * 100

Average length increase (cm) in sketch
* mean(8_MHI_Length_Increase_NoFishing cells in sketch polygon/s)

Average % length increase in sketch
* mean(8_MHI_Length_Increase_NoFishing / 5_MHI_Length_Present) * 100

