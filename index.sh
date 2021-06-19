#/bin/bash

tree -J -d -L 1 --noreport */ >.index/index.json.new
mv .index/index.json.new .index/index.json

for d in */ ; do
    mkdir -p .index/$d
    find $d. -maxdepth 1 -mindepth 1 -type d -printf "tree -J --noreport \"%p\" >\".index/$d%f_index.json\"\n"|sh

    lastJpg="$(find $d -type f -name *.jpg -printf '%T+ %p\n'|sort -r|head -n 1|awk '{print $2}')"
    echo $lastJpg
    ln -f -s ../../$lastJpg .index/$d/last.jpg
done
