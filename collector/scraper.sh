#! /bin/sh

## Static
#  catalog_renumbering
#  location
#  markers

echo "Remember to update the cookies before moving on"

echo "Collecting Event Data in the background..."
cd calendar
./collect.sh > calender.log &
cd ..

echo "Collecting Directory Data in the background..."
cd directory
for year in {2013..2018}; do
  ./scrapedir.sh $year > $year.log &
done
cd ..

echo "Scraping departments.js..."
time node departments.js # A-Z => Department

echo "Scraping classes.js..."
time node classes.js # Department => Class

echo "Scraping class.js..."
time node class.js # Class => Class

echo "Scraping terms.js..."
time node terms.js # Class => Term

echo "Scraping term.js..."
time node term.js # Term => Section

echo "Scraping section.js..."
time node section.js # Section => Section

echo "Scraping evaluations.js..."
time node evaluations.js # Term => Evaluation

echo "Scraping evaluationdetail.js..."
time node evaluationdetail.js # Evaluation => Evaluation

echo "