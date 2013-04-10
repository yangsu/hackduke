#! /bin/sh

YEAR=${1:-2013}
FILE=$YEAR.txt

for i in {a..z}{a..z}; do
  echo $i;
  ldapsearch -H ldap://ldap.duke.edu -LLL -b 'ou=People,dc=duke,dc=edu' -z 0 -l 0 -x "(&(duPSExpGradTermC1=$YEAR*)(uid=$i*)(eduPersonAffiliation=student))" > $FILE;
  node dir.js $FILE
done
