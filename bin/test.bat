@echo off

rem
rem
rem

rem このバッチが存在するフォルダをカレントに
pushd %0\..
cls



FOR /L %%i IN (1,1,3) DO (
    rem node ..\test\test.js
    start /MIN node ..\test\test.js
    rem timeout 0
)
pause
rem exit