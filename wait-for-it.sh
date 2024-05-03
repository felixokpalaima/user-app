#!/usr/bin/env bash
# Use this script to test if a given TCP host/port are available

CMDNAME=${0##*/}

echoerr() { if [[ $QUIET -ne 1 ]]; then echo "$@" 1>&2; fi }

usage()
{
    cat << USAGE >&2
Usage:
    $CMDNAME host:port [-s] [-t timeout] [-- command args]
    -q | --quiet                        Do not output any status messages
    -s | --strict                       Only execute subcommand if the test succeeds
    -t TIMEOUT | --timeout=timeout      Timeout in seconds, zero for no timeout
    -- COMMAND ARGS                     Execute command with args after the test finishes
USAGE
    exit 1
}

wait_for()
{
    if [[ $TIMEOUT -gt 0 ]]; then
        echoerr "$CMDNAME: waiting $TIMEOUT seconds for $HOST:$PORT"
    else
        echoerr "$CMDNAME: waiting for $HOST:$PORT without a timeout"
    fi
    start_ts=$(date +%s)
    while :
    do
        (echo > /dev/tcp/$HOST/$PORT) >/dev/null 2>&1
        result=$?
        if [[ $result -eq 0 ]]; then
            end_ts=$(date +%s)
            echoerr "$CMDNAME: $HOST:$PORT is available after $((end_ts - start_ts)) seconds"
            break
        fi
        sleep 1
    done
    return $result
}

wait_for_wrapper()
{
    # In order to support SIGINT during timeout: http://unix.stackexchange.com/a/57692
    if [[ $QUIET -eq 1 ]]; then
        timeout $TIMEOUT bash $0 --quiet --child --timeout=$TIMEOUT --host=$HOST --port=$PORT -- $CMD &
    else
        timeout $TIMEOUT bash $0 --child --timeout=$TIMEOUT --host=$HOST --port=$PORT -- $CMD &
    fi
    PID=$!
    trap "kill -INT -$PID" INT
    wait $PID
    WAIT_EXIT_CODE=$?
    if [[ $WAIT_EXIT_CODE -ne 0 ]]; then
        echoerr "$CMDNAME: timeout occurred after waiting $TIMEOUT seconds for $HOST:$PORT"
    fi
    return $WAIT_EXIT_CODE
}

# process arguments
while [[ $# -gt 0 ]]
do
    case "$1" in
        *:* )
        HOST=${1%:*}
        PORT=${1#*:}
        shift 1
        ;;
        -q | --quiet)
        QUIET=1
        shift 1
        ;;
        -s | --strict)
        STRICT=1
        shift 1
        ;;
        -t)
        TIMEOUT="${2}"
        if [[ $TIMEOUT == "" ]]; then break; fi
        shift 2
        ;;
        --timeout=*)
        TIMEOUT="${1#*=}"
        shift 1
        ;;
        --child)
        CHILD=1
        shift 1
        ;;
        --)
        shift
        CMD="$@"
        break
        ;;
        --help)
        usage
        ;;
        *)
        echoerr "Unknown argument: $1"
        usage
        ;;
    esac
done

if [[ "$HOST" == "" || "$PORT" == "" ]]; then
    echoerr "Error: you need to provide a host and port to test."
    usage
fi

TIMEOUT=${TIMEOUT:-15}
STRICT=${STRICT:-0}
QUIET=${QUIET:-0}

if [[ $CHILD -gt 0 ]]; then
    wait_for
    RESULT=$?
    if [[ $STRICT -eq 1 && $RESULT -ne 0 ]]; then
        echoerr "$CMDNAME: strict mode, refusing to execute subprocess"
        exit $RESULT
    fi
    exec $CMD
else
    wait_for_wrapper
    RESULT=$?
fi

exit $RESULT
