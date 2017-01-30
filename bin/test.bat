@echo off

rem
rem
rem

rem このバッチが存在するフォルダをカレントに
pushd %0\..
cls



FOR /L %%i IN (1,1,20) DO (
    start /MIN cmd /K node ..\test\test.js
    rem timeout 0
)
pause
rem exit