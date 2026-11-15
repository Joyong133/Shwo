@echo off
chcp 65001 >nul
cd /d "%~dp0"
python grab.py %*
if errorlevel 9009 (echo Python이 없습니다. https://www.python.org 에서 설치하세요 ^(설치 시 "Add python.exe to PATH" 체크^) & pause)
