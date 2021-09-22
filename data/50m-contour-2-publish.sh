#!/bin/bash
# Run outside workspace

DATASET_BUCKET=gp-hawaii-reports-next-datasets
FILE_PATH=dist/
FILE_PUBLISH_MATCHER=*50m_contour*.fgb

source ../.env
aws s3 cp --recursive $FILE_PATH s3://$DATASET_BUCKET --cache-control max-age=3600 --exclude "*" --include "$FILE_PUBLISH_MATCHER"