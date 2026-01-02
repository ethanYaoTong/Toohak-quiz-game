#!/bin/sh

REQUIRED_COMMANDS="echo find git grep npx sed uname xargs"
MISSING_COMMANDS=""

for cmd in $REQUIRED_COMMANDS; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        MISSING_COMMANDS="$MISSING_COMMANDS $cmd"
    fi
done

if [ -n "$MISSING_COMMANDS" ]; then
    echo "The following required commands are not found:"
    for cmd in $MISSING_COMMANDS; do
        echo "    $cmd"
    done
    echo
    echo "Please ensure they are installed before continuing."
    exit 1
fi

if [ "$#" -ne 2 ]; then
    echo "Usage:"
    echo "    $0 BACKEND_PORT FRONTEND_PORT"
    echo
    echo "Example:"
    echo "    $0 49153 3000"
    exit 1
fi

git stash
git fetch
git reset --hard origin/main

BACKEND_PORT=$1
FRONTEND_PORT=$2
ORIGINAL_BACKEND_PORT=49153

OS_NAME="$(uname)"
echo "Detected operating system: $OS_NAME"
echo

# Using sed -i.bak for compatibility with both Linux (GNU) and MacOS (FreeBSD)
grep --recursive --files-with-matches ${ORIGINAL_BACKEND_PORT} ./static \
    | xargs sed -i.bak "s/${ORIGINAL_BACKEND_PORT}/${BACKEND_PORT}/g"

find ./static -type f -name '*.bak' -delete

npx --yes http-server \
    --proxy "http://127.0.0.1:${FRONTEND_PORT}?" \
    --port ${FRONTEND_PORT}
