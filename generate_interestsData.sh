# !/bin/sh

node generate_interestsData.js $1 "$2.tmp"
native2ascii "$2.tmp" $2
rm "$2.tmp"

