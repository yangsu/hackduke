var querystring = require('querystring');

var config = {
  BASEURL: 'https://m.siss.duke.edu',
  EVALURL: 'http://assessment.aas.duke.edu/evaluations/saces/',
  CHUNKSIZE: 5,
  PHPSESSID: 'or0fb1q6a2v4mfs5861hpsg6v2',
  AAS: '"AAAAAQAAAQzkgyLEn%2fBmIjkH6Oheql1vRfC1E6pM7Gt%2fAAwrdea9v8Jib%2fVYuApCMNFNQQUPdjr35oBDJS%2fMrHBRBMvnuMPGaDRzJ41UOS7sxIuqoedjGT0s1ynmQkbEruEWBI01BnRKqbT0GmsScwUp15Q4nN4zI%2bPi9BrU3nmIJJ8y1syc9fbUtcttpuJuCF7ObF3iQlj4SfEDIIIZ7ZrlFIVn32%2bL4CueGr0zaCo7axhaAk43pw5ZBjCeNsqo%2fwwNfc25dyJEtnXXZAhUxZ7o5QdYh2i9wjiXLih8gwuZAv%2fO0lYstlJuaGUT5Tdnkj%2f%2bKHy5veA6fN3QkWaVrxrP4qjL4oXtac7XtS8wSwHxPGowAAAARDkcMBh50CPCpezSFkbx29AhIQob%2f%2fiAenPyTWwjazHrZmdiRnK7yMDVF2lXq8LfOT13RjM4VWcRlDP%2fh%2bVStP05llt%2bAAAA"'
};

config.COOKIE = querystring.stringify({
  PHPSESSID: config.PHPSESSID,
  'webdev_boris.aas.duke.edu': config.AAS
}, ';', '=');

module.exports = config;
