#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var xml2js = require('xml2js');
var config_path = argv["_"][0];
var parser = new xml2js.Parser();
var config_xml = fs.readFileSync(config_path);

parser.parseString(config_xml, function (err, result) {
  if(argv["_"][1] == 'id') {
    console.log(result.widget.$.id);
    process.exit(0);
  }
  if(argv["_"][1] == 'name') {
    console.log(result.widget.name[0]);
    process.exit(0);
  }
  console.log(config_xml+"");
});
