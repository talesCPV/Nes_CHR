#!/bin/bash
# Upload files to Github - https://github.com/talesCPV/Nes_CHR.git

now=$(date)

git init

git add *

git remote add origin "https://github.com/talesCPV/Nes_CHR.git"

git commit -m "by_script -> ${now}"

git push -f origin master


