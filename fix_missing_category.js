var fs = require('fs');
var readline = require('readline')
var stream = require('stream')

// [USAGE] node fix_missing_category.js file_to_be_processed category_in_json output_file
var fileName = process.argv[2];
console.log('Process file: ' + fileName);
var categoryFile = process.argv[3];
var output = process.argv[4]

// Load json
eval('var categories = ' + fs.readFileSync(categoryFile).toString());

var instream = fs.createReadStream(fileName)

var outstream = new fs.createWriteStream(output, {encoding: 'utf8', flags: 'a'});

var rl = readline.createInterface({
  input: instream,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line) {
  // Check if category is missed
  var tmp = line.split('\t');
  if (tmp.length < 4) {
    console.log("wrong format: " + line);
    return;
  }

  if (tmp.length == 4 && tmp[3].trim() != "") {
     // Just write back
     outstream.write(line);
     return;
  }

  // console.log('Found empty category: ' + line);
  // Find missed category
  var missedCategory = [];
  Object.keys(categories).forEach(function(key) {
    var index = line.indexOf(key);
    if (index > 0 && index < 20) {
      missedCategory = missedCategory.concat(categories[key]);
    }
  });

  outstream.write(line.replace('\n', '') + missedCategory.join(' '));
  outstream.write('\n');
});

rl.on('close', function() {
  console.log('End of processing file: ' + fileName);
});
