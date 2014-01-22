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

  // remove http://www. and http://*. prefix and the trailing slash.
  var parsedUrl = url.parse(domain.replace('*.', '').replace('www.', ''));

  if (!parsedUrl.protocol) {
    console.log('Invalid url: ' + domain);
    continue;
  }

  if (parsedUrl.query) {
    console.log('Skip rules with query: ' + domain);
    continue;
  }

  domain = parsedUrl.hostname;

  // Get top level domain
  var rootDomain = tld.registered(domain);
  var subdomainTokens = [];
  if (rootDomain != domain) {
    domain.substring(0, domain.length - rootDomain.length).
      split('.').forEach(function(sub) {
      if (!sub)
        return;
      subdomainTokens.push(sub + '.');
    });
    console.log(JSON.stringify(subdomainTokens));
  }

  if (!_results[rootDomain]) {
    _results[rootDomain] = {};
  }

  var pathName = parsedUrl.pathname.toLowerCase().replace(/\/$/, '');
  var pathNameTokens = [];
  pathName.split('/').forEach(function(p) {
    if (!p) return;
    pathNameTokens.push('/' + p);
  });

  var keywordTokens = subdomainTokens.concat(pathNameTokens);
  function _setKeyword(keyword) {
    var k = null;

    if (keyword == '__ANY' && keywordTokens.length == 0) {
      k = keyword;
    } else if (keyword == '__ANY') {
      k = keywordTokens.join(' ');
    } else {
      k = keywordTokens.concat([keyword]).join(' ');
    }

    ks = _results[rootDomain][k];
    if (!ks) {
      ks = _results[rootDomain][k] = [];
    }

    if (ks.indexOf(keyword) < 0) {
      ks.push(_category);
    }
  }

  // set keywords
  var keywords = (cells[4] || '__ANY').split('-');
  keywords.forEach(_setKeyword);
}

if (process.argv[3]) {
  fs.writeFileSync(process.argv[3], 'var interestsData = ' + JSON.stringify(_results, null, 4) + ';');
} else {
  console.log(_results);
}

