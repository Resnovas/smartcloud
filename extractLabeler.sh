#!/bin/bash

# Copy the files to label-mastermind

yes | cp -R -i packages/release-mastermind/src/api packages/label-mastermind/src
yes | cp -R -i packages/release-mastermind/src/conditions packages/label-mastermind/src
yes | cp -R -i packages/release-mastermind/src/utils packages/label-mastermind/src
yes | cp -R -i packages/release-mastermind/src/contextHandler.ts packages/label-mastermind/src
yes | cp -R -i .github/allconfigs.json packages/release-mastermind/.github/
yes | cp -R -i .github/allconfigs.json packages/label-mastermind/.github/
yes | cp -R -i .github/allconfigs.json packages/variable-mastermind/.github/
