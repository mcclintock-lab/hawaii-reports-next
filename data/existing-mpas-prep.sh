#!/bin/bash

psql -t <<SQL
  DROP TABLE IF EXISTS existing_mpas;
  DROP TABLE IF EXISTS existing_mpas_final;
  DROP TABLE IF EXISTS existing_mpas_final_bundles;
SQL

if [ ! -d "src/existing_mpas.gdb" ]; then
  echo 'Missing existing_mpas dataset'
  exit 0
fi

if [ -f "dist/existing_mpas.geojson" ]; then
  rm dist/existing_mpas.geojson
fi
ogr2ogr -t_srs "EPSG:4326" -nln existing_mpas -f GeoJSON  dist/existing_mpas.geojson src/existing_mpas.gdb existing_mpas_herb_prot_level
ogr2ogr -t_srs "EPSG:4326" -append -nln existing_mpas -f GeoJSON  dist/existing_mpas.geojson src/existing_mpas.gdb existing_mpas_updated_mar2018
ogr2ogr -t_srs "EPSG:4326" -append -nln existing_mpas -f GeoJSON  dist/existing_mpas.geojson src/existing_mpas.gdb existing_mpa_nearshore_only50m

# Don't reuse OBJECT_ID as fid because not unique due to merge
ogr2ogr -overwrite -lco LAUNDER=NO -lco GEOMETRY_NAME=geom -lco FID=gid -nln existing_mpas -f PostgreSQL "PG:host=${PGHOST} user=${PGUSER} dbname=${PGDATABASE} password=${PGPASSWORD}" dist/existing_mpas.geojson

# Subdivide into new table land_subdivided
psql -f existing-mpas.sql
