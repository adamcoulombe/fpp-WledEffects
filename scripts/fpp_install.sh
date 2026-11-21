#!/bin/bash
set -e
# fppd reads commands/descriptions.json only at startup on FPP 9 and older.
# This plugin's version entries span those releases, so ask FPP to restart
# fppd after install to register the "WLED Effect Start" command.
# Make sure the command script and callbacks are executable - a git checkout
# or a zip upload can otherwise drop the executable bit and fppd's execve of
# the command script then fails silently (the command still logs "complete").
# Do NOT use $SRCDIR here: FPP passes it as a trailing argument (and on FPP 9
# sudo strips it from the environment), and it points at FPP's src tree, not
# at this plugin. Locate our own directory from the script path instead.
case "$0" in
    */scripts/*) PLUGIN_DIR=$(cd "$(dirname "$0")/.." && pwd) ;;
    *)           PLUGIN_DIR=$(cd "$(dirname "$0")" && pwd) ;;
esac
chmod +x "$PLUGIN_DIR/commands/startWledEffect.sh" "$PLUGIN_DIR/callbacks" 2>/dev/null || true

( set +u; source "${FPPDIR:-/opt/fpp}/scripts/common" && setSetting restartFlag 1 ) || true
exit 0
