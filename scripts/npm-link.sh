#!/bin/sh

echo "npm linking ..."

cp -f ./package.json ./dist

perl -pi -w -e 's/"prepublish": "exit 1"/"prepublish": ""/g;' ./dist/package.json

cd ./dist
npm link
