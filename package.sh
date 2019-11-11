#!/bin/bash

SOURCE_DIR=src
SOURCE_DEPS=$SOURCE_DIR/node_modules
TARGET_PKG=package.zip

if [ ! -d $SOURCE_DEPS ]; then
    echo "Could not find $SOURCE_DEPS, do 'npm install' in $SOURCE_DIR"
    exit 1
fi


if [ -f $TARGET_PKG ]; then
    echo "Deleting current package"
    (rm -f $TARGET_PKG && echo "Successfully deleted $TARGET_PKG") || exit 1
fi

echo "Creating zip file..."
(cd $SOURCE_DIR && zip -r ../$TARGET_PKG .) || exit 1

echo "Done, upload to AWS Lambda."