#/bin/bash

tree -J -d -L 1 --noreport */ >.index/index.json.new
mv .index/index.json.new .index/index.json

for d in */ ; do
    mkdir -p .index/$d
    find -L $d. -maxdepth 1 -mindepth 1 -type d -printf "tree -J -D --noreport \"%p\" >\".index/$d%f_index.json\"\n"|sh
done
