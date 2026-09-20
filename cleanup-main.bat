@echo off
cd /d "C:\NewWaveProjetos\jrtercerisados"
echo Started
git rm -r --cached supabase/.temp/ --quiet
if %ERRORLEVEL% NEQ 0 echo "git rm failed but continuing"
echo TempUntracked
git add -A
echo Staged
git commit -m "chore: untrack generated .temp files, commit Sobre fixes" --no-verify
echo Committed
git push origin main
echo ALL_DONE
