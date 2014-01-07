var fs = require('fs');
var url = require('url');
var tld = require('./node-tld/lib/tld.js');

var fileName = process.argv[2];

var content = fs.readFileSync(process.argv[2]).toString().split("\n");

var _category = '';
var _results = {};

for (var num in content) {
  // ignore the caption.
  if (0 == num)
    continue;

  var cells = content[num].split(',');
  if (cells.length !== 5) {
    continue;
  }

  if (cells[0]) {
    _category = cells[1];
  }

  var domain = cells[3].trim();
  if (!domain) {
    continue;
  }

  // remove http:// prefix and the trailing slash.
  var WILD_CARD_PLACE_HOLDER = 'awefwefwefwewsssssssfewfwe';  // Make sure * is parsed
  var parsedUrl = url.parse(domain.replace('*', WILD_CARD_PLACE_HOLDER));

  if (!parsedUrl.protocol) {
    console.log('Invalid url: ' + domain);
    continue;
  }

  if (parsedUrl.query) {
    console.log('Skip rules with query: ' + domain);
    continue;
  }

  domain = parsedUrl.hostname.replace(WILD_CARD_PLACE_HOLDER, '*');

  // Check the top level domain, only keep the root domain for *.domain.com
  var rootDomain = tld.registered(domain);
  if (domain == "*." + rootDomain) {
    console.log("Only keep root domain: " + domain);
    domain = rootDomain;
  }

  if (!_results[domain]) {
    _results[domain] = {};
  }

  var pathName = parsedUrl.pathname.toLowerCase().replace(/\/$/, '');
  if (pathName != '') {
    if (!_results[domain]['__PATH']) {
      _results[domain]['__PATH'] = {};
    }

    _results[domain]['__PATH'][pathName] = {};
  }


  function fixedHex(number, length) {
    var str = number.toString(16).toUpperCase();
    while (str.length < length) {
      str = "0" + str;
    }

    return str;
  }

  function toUnicode(str) {
    var result = "";

    for (var i = 0; i < str.length; i++) {
      var charCode = str.charCodeAt(i);
      if (charCode > 126 || charCode < 32) {
        result += "\\u" + fixedHex(charCode, 4);
      } else {
        result += str[i];
      }
    }

    return result;
  }

  function _setKeyword(keyword) {
    var container = pathName ? _results[domain]['__PATH'][pathName] : _results[domain];

    // keyword = toUnicode(keyword.trim());
    keyword = keyword.trim();
    var ks = container[keyword];
    if (!ks) {
      ks = container[keyword] = [];
    }

    if (ks.indexOf(keyword) < 0) {
      ks.push(_category);
    }
  }

  // set keywords
  var keywords = (cells[4] || '__ANY').split('-');
  keywords.forEach(_setKeyword);
  // _setKeyword(cells[4] || '__ANY');
}

if (process.argv[3]) {
  fs.writeFileSync(process.argv[3], 'var interestsdata = ' + JSON.stringify(_results, null, 4) + ';');
} else {
  console.log(_results);
}

