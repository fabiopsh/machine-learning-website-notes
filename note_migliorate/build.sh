#!/usr/bin/env bash
# Rigenera i dati delle figure e compila le note riorganizzate.
# Uso (da questa cartella):
#   ./build.sh            compila soltanto (usa i dati già presenti in dati/)
#   ./build.sh dati       rigenera prima i dati con script/genera_dati.py (richiede uv)
# Il PDF prodotto si chiama Machine_Learning_Note_Migliorate_v<N>.pdf, con N letto da versione.tex:
# i PDF delle versioni precedenti restano intatti. Per una nuova versione si aumenta N in versione.tex.
set -euo pipefail
cd "$(dirname "$0")"

if [ "${1:-}" = "dati" ]; then
  uv run script/genera_dati.py
fi

VERSIONE=$(sed -n 's/.*\\newcommand{\\versione}{\([0-9][0-9]*\)}.*/\1/p' versione.tex)
if [ -z "$VERSIONE" ]; then
  echo "Numero di versione non trovato in versione.tex" >&2
  exit 1
fi

tectonic -X compile main.tex
cp main.pdf "Machine_Learning_Note_Migliorate_v${VERSIONE}.pdf"
echo "PDF: $(pwd)/Machine_Learning_Note_Migliorate_v${VERSIONE}.pdf"
