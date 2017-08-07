#!/bin/bash -ex
echo $USER
echo $(pwd)
echo $HOME


npm --registry http://npm-registry.spotify.net install
npm run test
