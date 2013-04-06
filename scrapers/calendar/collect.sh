#! /bin/sh

# Params
MONTH=${1:-$(date +'%m')}
YEAR=${2:-$(date +'%Y')}

MONTHURL="http://calendar.duke.edu/events/index.json?date_span=month&user_date=$MONTH%2F01%2F$YEAR"

# Current Day URL
DAYURL="http://calendar.duke.edu/events/index.json?date_span=day"

# Generate Time stamp
TIMESTAMP=$(date +%s)

# Generate Output File name
OUTPUT="$TIMESTAMP".json

URL=$MONTHURL

curl -H 'Accept: application/json' -s "$URL"  | python -mjson.tool > $OUTPUT

# Print Date
echo
echo $(date)
echo $URL

node calendar.js $OUTPUT

# Clean up
# rm $OUTPUT