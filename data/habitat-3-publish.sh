#!/bin/bash
# Run outside workspace

source ../.env
source ./habitat.env

# Publish to s3.  Defaults to dry-run, remove to actually publish
AWS_REGION=${AWS_REGION} npx geoprocessing bundle-features gp-hawaii-reports-next-${LAYER_NAME} ${LAYER_NAME} \
   --connection "postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}" \
   --points-limit 49000 \
   --envelope-max-distance 200