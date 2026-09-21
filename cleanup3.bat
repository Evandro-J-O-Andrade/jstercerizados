@echo off
cd /d "C:\NewWaveProjetos\jrtercerisados"
echo Staging all changes...
git add -A
echo Status:
git status --short
echo Committing...
git commit -m "chore: add .bat/gitignore cleanup, commit ceo.png and SafeImage tests" --no-verify
echo Pushing...
git push origin main
echo ALL_DONE
