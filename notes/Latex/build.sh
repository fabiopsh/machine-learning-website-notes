#!/usr/bin/env bash
# Rigenera chapters/*.tex dagli appunti Markdown in ../Appunti,
# copia le immagini e compila il PDF con tectonic.
# Ogni build riuscita incrementa la versione (file VERSION: MAJOR.MINOR)
# e salva il PDF finale come ../Machine_Learning_Appunti_vX.Y.pdf.
# Uso:  ./build.sh           (incrementa la minor: 1.0 -> 1.1)
#       ./build.sh major     (incrementa la major: 1.4 -> 2.0)
set -euo pipefail
cd "$(dirname "$0")"

cur=$(cat VERSION 2>/dev/null || echo "1.0")
major=${cur%%.*}; minor=${cur#*.}
if [ "${1:-}" = "major" ]; then next="$((major + 1)).0"; else next="$major.$((minor + 1))"; fi
printf '\\newcommand{\\docversion}{%s}\n' "$next" > version.tex

mkdir -p chapters images
cp ../Appunti/assets/*.png images/

for f in ../Appunti/[0-9][0-9]\ -\ *.md; do
  n=$(basename "$f" | cut -c1-2)
  pandoc "$f" \
    -f markdown+wikilinks_title_after_pipe-implicit_figures \
    -t latex --top-level-division=chapter --syntax-highlighting=none \
    --lua-filter=obsidian.lua -o "chapters/$n.tex"
  echo "ok  $n  <-  $(basename "$f")"
done

tectonic main.tex

# build riuscita: registra la versione e pubblica il PDF finale
echo "$next" > VERSION
rm -f ../Machine_Learning_Appunti_v*.pdf
cp main.pdf "../Machine_Learning_Appunti_v$next.pdf"
echo "Versione $next -> ../Machine_Learning_Appunti_v$next.pdf"
