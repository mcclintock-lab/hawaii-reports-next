
source ../.env

# Copy all dist biomass files
aws s3 cp --recursive dist/ s3://gp-hawaii-reports-next-datasets --cache-control max-age=3600 --exclude "*" --include "*biomass*.*"