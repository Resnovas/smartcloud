#!/bin/bash
yes | cp -R -i docs/output/release.md README.md

# Copy the files to release-mastermind
yes | cp -R -i docs/output/release.md packages/release-mastermind/
yes | cp -R -i .github/allconfigs.json packages/release-mastermind/.github/

# Copy the files to label-mastermind
yes | cp -R -i packages/release-mastermind/src/conditions packages/label-mastermind/src
yes | cp -R -i packages/release-mastermind/src/utils packages/label-mastermind/src
yes | cp -R -i packages/release-mastermind/src/contextHandler.ts packages/label-mastermind/src
yes | cp -R -i .github/allconfigs.json packages/label-mastermind/.github/

# Copy the files to convention-mastermind
yes | cp -R -i packages/release-mastermind/src/conditions packages/convention-mastermind/src
yes | cp -R -i packages/release-mastermind/src/utils packages/convention-mastermind/src
yes | cp -R -i packages/release-mastermind/src/contextHandler.ts packages/convention-mastermind/src
yes | cp -R -i .github/allconfigs.json packages/convention-mastermind/.github/

# Copy the files to variable-mastermind
yes | cp -R -i .github/allconfigs.json packages/variable-mastermind/.github/