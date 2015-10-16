document.write('current version of nodejs ' + process.version);

var fs = require('fs');

var contents = fs.readFileSync('./package.json', 'utf8');
alert(contents);
