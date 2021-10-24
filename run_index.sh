#/bin/bash

tree -J -d -L 1 --noreport */ >.index/index.json.new
mv .index/index.json.new .index/index.json

for d in */ ; do
    mkdir -p .index/$d
    find $d. -maxdepth 1 -mindepth 1 -mtime 0 -type d -printf "tree -J -D --noreport \"%p\" >\".index/$d%f_index.json\"\n"|sh
    find $d. -mmin -60 -name *.mp4 -exec ./do_thumbnail.sh {} \;

#    lastJpg="$(find $d -type f -name *.jpg -printf '%T+ %p\n'|sort -r|head -n 1|awk '{print $2}')"
#    echo $lastJpg
#    ln -f -s ../../$lastJpg .index/$d/last.jpg
done
