#!/bin/bash
# Upload files to Github - https://github.com/talesCPV/Nes_CHR.git
# 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

now=$(date)

curl -H https://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:x-oauth-basic@github.com/talesCPV/Nes_CHR.git

git init

git add *

git remote add origin "https://github.com/talesCPV/Nes_CHR.git"

git commit -m "by_script -> ${now}"

git push -f origin master



# https://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:x-oauth-basic@github.com
# curl -H 'Authorization: token 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' https://github.com/talesCPV/Nes_CHR.git
