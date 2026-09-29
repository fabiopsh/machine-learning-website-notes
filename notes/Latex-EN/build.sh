#!/usr/bin/env bash
# Compiles the English translation of the notes with tectonic.
# chapters/*.tex are hand-translated from ../Latex/chapters (NOT regenerated from Markdown).
# Output: ../Machine_Learning_Notes_EN_vX.Y.pdf (version read from VERSION).
set -euo pipefail
cd "$(dirname "$0")"
v=$(cat VERSION)
printf '\\newcommand{\\docversion}{%s}\n' "$v" > version.tex
tectonic main.tex
rm -f ../Machine_Learning_Notes_EN_v*.pdf
cp main.pdf "../Machine_Learning_Notes_EN_v$v.pdf"
echo "Version $v -> ../Machine_Learning_Notes_EN_v$v.pdf"
