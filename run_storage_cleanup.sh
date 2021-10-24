#/bin/bash

find ./5L079A0PAJ409AC-11 -name *.idx -exec rm {} \;
find ./5L079A0PAJ409AC-11 -name *.*_ -mtime +1 -exec rm {} \;
find -L ./5L079A0PAJ409AC-11 -name *.mp4 -mtime +14 -exec ./do_archive.sh {} \;
#find -L ./5L079A0PAJ409AC-11 -type d -empty -delete
#find ./5L079A0PAJ409AC-11 -name *archive*.jpg -mtime +60 -exec rm {} \;

find ./5L079A0PAJA465E-12 -name *.idx -exec rm {} \;
find ./5L079A0PAJA465E-12 -name *.*_ -mtime +1 -exec rm {} \;
find -L ./5L079A0PAJA465E-12 -name *.mp4 -mtime +14 -exec ./do_archive.sh {} \;
#find -L ./5L079A0PAJA465E-12 -type d -empty -delete
#find ./5L079A0PAJA465E-12 -name *archive*.jpg -mtime +60 -exec rm {} \;
