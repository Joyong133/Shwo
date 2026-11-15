#!/bin/sh
# 리눅스 / macOS / 안드로이드(Termux) 실행용
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then exec python3 grab.py "$@"
elif command -v python >/dev/null 2>&1; then exec python grab.py "$@"
else
  echo "Python 3 이 필요합니다."
  echo "  Ubuntu/Debian: sudo apt install python3"
  echo "  Fedora:        sudo dnf install python3"
  echo "  Termux:        pkg install python"
  exit 1
fi
