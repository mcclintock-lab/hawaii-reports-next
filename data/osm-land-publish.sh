source ../../.env

# Publish to s3.  Defaults to dry-run, remove to actually publish
AWS_REGION=${AWS_REGION} npx geoprocessing bundle-features global-clipping-osm-land osm_land_subdivided \
   --connection "postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}" \
   --points-limit 4500 \
   --envelope-max-distance 200