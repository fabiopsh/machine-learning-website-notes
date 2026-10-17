#!/usr/bin/env bash
# Rigenera i dati delle figure e compila le note riorganizzate.
# Uso (da questa cartella):
#   ./build.sh            compila soltanto (usa i dati già presenti in dati/)
#   ./build.sh dati       rigenera prima i dati con script/genera_dati.py (richiede uv)
set -euo pipefail
cd "$(dirname "$0")"

if [ "${1:-}" = "dati" ]; then
  uv run script/genera_dati.py
fi

tectonic -X compile main.tex
cp main.pdf Machine_Learning_Note_Migliorate.pdf
echo "PDF: $(pwd)/Machine_Learning_Note_Migliorate.pdf"
