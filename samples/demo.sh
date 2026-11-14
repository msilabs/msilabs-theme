#!/usr/bin/env bash
# Shell sample
set -e

NAME="msilabs"
OUT="$HOME/build"

greet() {
  echo "Hello, $1 (${NAME})"
}

if [ -d "$OUT" ]; then
  echo "cleaning $OUT"
  rm -r "$OUT"
fi

for file in src/*.mjs; do
  greet "$file"
done

COUNT=$(ls -1 src | wc -l)
echo "files: $COUNT"
