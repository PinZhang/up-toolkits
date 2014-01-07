var fs = require('fs');
var readline = require('readline')
var stream = require('stream')

// [USAGE] node fix_extra_tab_splitter.js file_to_be_processed output_file
var fileName = process.argv[2];
console.log('Process file: ' + fileName);
var output = process.argv[3]

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
  if (tmp.length != 4) {
    console.log("wrong format: " + line);
    return;
  }

  outstream.write(line);
});

rl.on('close', function() {
  console.log('End of processing file: ' + fileName);
});
