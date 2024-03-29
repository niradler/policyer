#!/bin/bash

# https://docs.github.com/en/actions/learn-github-actions/environment-variables

if [[ $GITHUB_ACTIONS != "true" ]]; then
    echo "Not a Github action"
else
    echo "Github action:"
    echo "GITHUB_REF=${GITHUB_REF}"
    echo "GITHUB_REPOSITORY=${GITHUB_REPOSITORY}"
    echo "GITHUB_SHA=${GITHUB_SHA}"
    echo "GITHUB_ACTOR=${GITHUB_ACTOR}"
    echo "GITHUB_RUN_NUMBER=${GITHUB_RUN_NUMBER}"
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
elif [ -n "$INPUT_INTERNAL" ] && [ "$INPUT_INTERNAL" = "false" ]; then
    FLAGS="${FLAGS} --internal false"
fi

PROVIDER='policyer'

if [[ -n $INPUT_PROVIDER ]]; then
    PROVIDER=$INPUT_PROVIDER
fi

echo "PROVIDER=${PROVIDER}"

echo "${PROVIDER} ${FLAGS}"

if [ "$PROVIDER" = "local" ]; then
    npm i && npm run start -- "$FLAGS"
else
    npm i -g policyer
    npm i -g "$PROVIDER"
    $PROVIDER --version
    $PROVIDER "$FLAGS"
fi

EXIT_CODE=$?

exit $EXIT_CODE
