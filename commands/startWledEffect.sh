#!/bin/sh
# FPP command "WLED Effect Start".
#
# fppd calls this with the command arguments as positional parameters:
#   $1 models (comma separated), $2 auto-enable, $3 effect name, $4.. effect args
# It forwards them verbatim to FPP's built-in "Overlay Model Effect" command
# and applies the Multisync hosts saved by this plugin's settings page.
# Deliberately uses only /bin/sh, sed and curl - no interpreter dependency.

set -u

SCRIPTDIR="${SCRIPTDIR:-$(dirname "$0")}"
MEDIADIR="${MEDIADIR:-/home/fpp/media}"
LOGDIR="${LOGDIR:-$MEDIADIR/logs}"
LOG="$LOGDIR/plugin-fpp-WledEffects.log"
CFG="$MEDIADIR/config/plugin.fpp-WledEffects.json"

log() {
    printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$LOG" 2>/dev/null || true
}

log "WLED Effect Start: invoked with $# args: $*"

if [ "$#" -lt 3 ]; then
    log "WLED Effect Start: need Models, AutoEnable and Effect"
    echo "WLED Effect Start requires Models, AutoEnable and Effect"
    exit 1
fi

json_escape() {
    printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

args_json=""
for arg in "$@"; do
    esc=$(json_escape "$arg")
    if [ -z "$args_json" ]; then
        args_json="\"$esc\""
    else
        args_json="$args_json,\"$esc\""
    fi
done

multisync=false
hosts=""
if [ -f "$CFG" ]; then
    ms=$(sed -n 's/.*"multisync"[[:space:]]*:[[:space:]]*\([^,}]*\).*/\1/p' "$CFG" | head -1 | tr -d ' "')
    case "$ms" in
        true|1|True|TRUE) multisync=true ;;
    esac
    hosts=$(sed -n 's/.*"systems"[[:space:]]*:[[:space:]]*\[\([^]]*\)\].*/\1/p' "$CFG" | head -1 | tr -d '"' | tr -d ' ')
fi

payload="{\"command\":\"Overlay Model Effect\",\"args\":[$args_json]"
if [ "$multisync" = true ] && [ -n "$hosts" ]; then
    payload="$payload,\"multisyncCommand\":true,\"multisyncHosts\":\"$hosts\""
fi
payload="$payload}"

log "WLED Effect Start: payload=$payload"

response=$(curl --connect-timeout 3 --max-time 10 -s -w '\n%{http_code}' \
    -H 'Content-Type: application/json' \
    --data "$payload" \
    'http://localhost/api/command') || response="000"
code=$(printf '%s\n' "$response" | tail -1)
body=$(printf '%s\n' "$response" | sed '$d')

log "WLED Effect Start: HTTP $code response=$body"

exit 0
