#!/bin/bash
# Upload files to Github - https://github.com/talesCPV/Nes_CHR.git
# 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

now=$(date)

git init

git add *

git remote add origin "https://github.com/talesCPV/Nes_CHR.git"

git commit -m "by_script -> ${now}"

git push -f origin master

