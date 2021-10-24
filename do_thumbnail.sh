#!/bin/sh

imgname=${1%.*}
if [ ! -f $imgname.jpg ]; then
    ffmpeg -n -i $1 -frames:v 1 $imgname.jpg || touch $imgname.jpg
fi
