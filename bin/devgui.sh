#!/bin/sh

ME="$(test -L "$0" && readlink -f "$0" || echo "$0")"
DEVGUI="$(dirname "$(dirname "$ME")")"
SERVER="$DEVGUI/server.js"

case `uname -a` in
Linux*x86_64*)  echo "Linux 64 bit"
    node $SERVER "$@" -a x-www-browser
    ;;

Linux*i686*)  echo "Linux 32 bit"
    node $SERVER "$@" -a x-www-browser
    ;;

Linux*arm*)  echo "Linux ARM"
    node $SERVER "$@" -a x-www-browser
    ;;

Darwin*)  echo  "OSX"
    node $SERVER "$@" -a open
    ;;

FreeBSD*64*) echo "FreeBSD 64 bit"
    node $SERVER "$@" -a open
    ;;

CYGWIN*)  echo  "Cygwin"
    node $SERVER "$@" -a "cmd /c start"
    ;;

MING*)  echo  "MingW"
    node $SERVER "$@" -a "cmd /c start"
    ;;

SunOS*)  echo  "Solaris"
    node $SERVER "$@"
    ;;


*) echo "Unknown OS"
   ;;
esac
