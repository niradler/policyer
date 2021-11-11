#!/bin/bash

# https://docs.github.com/en/actions/learn-github-actions/environment-variables

if [[ $GITHUB_ACTIONS != "true" ]]; then
    echo "Not a Github action"
    # exit 1
else
    echo "Github action"
fi

FLAGS=''

[[ -n "$INPUT_VERBOSE" ]] && FLAGS="--verbose"
[[ -n "$INPUT_CHECKS_PATH" ]] && FLAGS="${FLAGS} --path ${INPUT_CHECKS_PATH}"
[[ -n "$INPUT_OUTPUT_PATH" ]] && FLAGS="${FLAGS} --output ${INPUT_OUTPUT_PATH}"
[[ -n "$INPUT_FORMAT" ]] && FLAGS="${FLAGS} --format ${INPUT_FORMAT}"
[[ -n "$INPUT_FAIL_ON" ]] && FLAGS="${FLAGS} --failOn ${INPUT_FAIL_ON}"
[[ -n "$INPUT_FAIL_ON_VALUE" ]] && FLAGS="${FLAGS} --failOnValue ${INPUT_FAIL_ON_VALUE}"
[[ -n "$INPUT_FILTER" ]] && FLAGS="${FLAGS} --filter ${INPUT_FILTER}"
[[ -n "$INPUT_FILTER_FLAGS" ]] && FLAGS="${FLAGS} --filterFlags ${INPUT_FILTER_FLAGS}"

if [ -n "$INPUT_INTERNAL" ] && [ "$INPUT_INTERNAL" = "true" ]; then
    FLAGS="${FLAGS} --internal true"
fi
if [ -n "$INPUT_INTERNAL" ] && [ "$INPUT_INTERNAL" = "false" ]; then
    FLAGS="${FLAGS} --internal false"
fi

echo "GITHUB_REF=${GITHUB_REF}"
echo "GITHUB_REPOSITORY=${GITHUB_REPOSITORY}"
echo "GITHUB_SHA=${GITHUB_SHA}"
echo "GITHUB_ACTOR=${GITHUB_ACTOR}"
echo "GITHUB_RUN_NUMBER=${GITHUB_RUN_NUMBER}"

echo "Flags: ${FLAGS}"
pwd
ls

RESULTS=''
PROVIDER='policyer'

if [[ -n $INPUT_PROVIDER ]]; then
    PROVIDER=$INPUT_PROVIDER
fi
RESULTS=$(npm i -g "$PROVIDER" && "$PROVIDER" "$FLAGS")

EXIT_CODE=$?

echo "$RESULTS"

RESULTS="${RESULTS//$'\\n'/''}"

echo "::set-output name=results::$RESULTS"

exit $EXIT_CODE
