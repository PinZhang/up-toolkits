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

  var domain = cells[2].trim();
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
    _results[domain] = [];
  }

  _results[domain].push(_category);
}

if (process.argv[3]) {
  fs.writeFileSync(process.argv[3], JSON.stringify(_results, null, 4));
} else {
  console.log(_results);
}

