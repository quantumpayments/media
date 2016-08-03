#!/bin/bash

git add -u
git commit -m "$1"
git push origin master

npm --no-git-tag-version version patch
npm publish

