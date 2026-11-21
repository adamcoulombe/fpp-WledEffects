#!/bin/bash
set -e
# Nothing outside the plugin directory needs cleaning up. Ask FPP to restart
# fppd so the command is withdrawn on FPP 9 and older too.
( set +u; source "${FPPDIR:-/opt/fpp}/scripts/common" && setSetting restartFlag 1 ) || true
exit 0
