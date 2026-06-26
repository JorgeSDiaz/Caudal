# syntax=docker/dockerfile:1
FROM postgres:16

# Scripts placed here run once, the first time the data volume is initialized.
# We'll drop seed/bootstrap SQL into db/initdb/ as the schema grows.
COPY initdb/ /docker-entrypoint-initdb.d/
