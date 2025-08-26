#!/bin/sh
set -e

# Entry script to copy a DB file from a mounted persistent path into the app server
# Usage: set COPY_DB_ON_START=1 (or true) in environment to enable copying on each start.

SRC="/app-server-data/quiz_master.db"
DST="/app/server/quiz_master.db"

echo "docker-entrypoint: starting"

if [ "${COPY_DB_ON_START}" = "1" ] || [ "${COPY_DB_ON_START}" = "true" ]; then
  if [ -f "${SRC}" ]; then
    mkdir -p "$(dirname "${DST}")"
    cp -f "${SRC}" "${DST}"
    echo "docker-entrypoint: copied ${SRC} -> ${DST}"
  else
    echo "docker-entrypoint: COPY_DB_ON_START set but ${SRC} not found; skipping copy"
  fi
else
  echo "docker-entrypoint: COPY_DB_ON_START not set; skipping DB copy"
fi

echo "docker-entrypoint: running CMD: $@"
exec "$@"
