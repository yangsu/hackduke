var querystring = require('querystring');

var config = {
  BASEURL: 'https://m.siss.duke.edu',
  EVALURL: 'http://assessment.aas.duke.edu/evaluations/saces/',
  CHUNKSIZE: 25,
  PHPSESSID: 'bp409mr6q8na27t8v33b0t88n4',
  AAS: '"AAAAAQAAARzggAIo2ZLRSN%2fnFITXm4uad9R6YPOmOwPTga2BxAyVEuthYhXz0jKldsN25U35qMlqiJxceVPkm%2br2kqpNffQ27Mjwv5a8ZFgGErD0iz43WY3Swoi4yMrwjwQVyFd2%2b66R3UL4RSlYdqncMsxVhtJrBg%2fhxF0ZGw9gW9kuXcl165UhwWT0ku%2bXo0%2fyN5r1Gg5PRoHMDMejLlyBKAZRmFjCeSzfJ4vXpwpyJ9oN%2f6dQwRGzLs3OUjbyM%2fKN7IfYJkHE6fC%2fJmreBiIIum8tafgFJMqx2WxSCGh9KU%2b%2fpXCzl8rPPdMacmLzP4uC%2bHmp8C404XKS8ekgIJrCT4ySWgVTQdROwIveU264W3YG7h0axjas%2b%2fXvC2cim%2bly5gAAAESs26%2bG17d9c5eOTLCXavR3JeL3suVKSmSoP9apiVz39iEMDLTzar%2fLsZ4NfIKuHytwS0RA1m2lN93bk5lgQ1ZVdOZ5NgAA"'
};

config.COOKIE = querystring.stringify({
  PHPSESSID: config.PHPSESSID,
  'webdev_boris.aas.duke.edu': config.AAS
}, ';', '=');

module.exports = config;
