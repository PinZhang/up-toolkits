var fs = require('fs');

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
  var tmps = /https*:\/\/(www>)*(.+)/i.exec(domain);
  if (!tmps || tmps.length !== 3) {
    continue;
  }

  if (tmps[2][tmps[2].length - 1] == '/') {
    domain = tmps[2].substring(0, tmps[2].length - 1);
  } else {
    domain = tmps[2];
  }

  if (!_results[domain]) {
    _results[domain] = {};
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
    // keyword = toUnicode(keyword.trim());
    keyword = keyword.trim();
    var ks = _results[domain][keyword];
    if (!ks) {
      ks = _results[domain][keyword] = [];
    }

    if (ks.indexOf(keyword) < 0) {
      ks.push(_category);
    }
  }

  // set keywords
  // var keywords = (cells[4] || '__ANY').split('-');
  // keywords.forEach(_setKeyword);
  _setKeyword(cells[4] || '__ANY');
}

if (process.argv[3]) {
  fs.writeFileSync(process.argv[3], 'var interestsdata = ' + JSON.stringify(_results, null, 4) + ';');
} else {
  console.log(_results);
}

