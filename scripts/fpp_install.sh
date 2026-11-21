#!/bin/bash
set -e
# fppd reads commands/descriptions.json only at startup on FPP 9 and older.
# This plugin's version entries span those releases, so ask FPP to restart
# fppd after install to register the "WLED Effect Start" command.
# Make sure the command script and callbacks are executable - a git checkout
# or a zip upload can otherwise drop the executable bit and fppd's execve of
# the command script then fails silently (the command still logs "complete").
[ -n "${SRCDIR:-}" ] && chmod +x "$SRCDIR/commands/startWledEffect.sh" "$SRCDIR/callbacks" 2>/dev/null || true

( set +u; source "${FPPDIR:-/opt/fpp}/scripts/common" && setSetting restartFlag 1 ) || true
exit 0
