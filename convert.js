var fs = require('fs');
var url = require('url');

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
  var WILD_CARD_PLACE_HOLDER = 'awefwefwefwewsssssssfewfwe';  // Make sure * is parsed
  var parsedUrl = url.parse(domain.replace('*', WILD_CARD_PLACE_HOLDER));

  if (!parsedUrl.protocol) {
    console.log('Invalid url: ' + domain);
    continue;
  }

  domain = parsedUrl.hostname.replace(WILD_CARD_PLACE_HOLDER, '*').replace(/^www\./i, '');
  var pathName = parsedUrl.pathname.toLowerCase().replace(/\/$/, '');

  domain += pathName;
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

