#!/usr/bin/env sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/server"
if [ ! -f .env ]; then
  echo 'Create server/.env from server/.env.example and configure MySQL and API keys first.' >&2
  exit 1
fi
npm ci
exec npm start
