#! /bin/sh

## Static
#  catalog_renumbering
#  location

echo "Remember to update the cookies before moving on"

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