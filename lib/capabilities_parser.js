#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2))
var fs = require('fs')
var push = require('obj-push')

var platform = argv["pltform"]
var env = argv["env"]
var caps_path = argv["caps"]
var caps = {}

try {
  if(fs.accessSync(caps_path, fs.R_OK) == null) {
    caps = require(caps_path);
  }
}catch(e){
  caps = platform == 'android' ? require('./android.json') : require('./ios.json');
}

caps["app"] = argv["app"]
caps["app-package"] = argv["app-package"]

if(env == 'sauce') {
  var sauce_wd_config = require('./sauce.json')
  sauce_wd_config.username = argv["sauce_user"]
  sauce_wd_config.accessKey  = argv["sauce_key"]
  caps = push(caps, sauce_wd_config);
}
else if(env == 'testdroid') {
  var testdroid_wd_config = require('./testdroid.json')
  testdroid_wd_config["testdroid_username"] = argv["td_user"]
  testdroid_wd_config["testdroid_password"] = argv["td_pass"]
  testdroid_wd_config["testdroid_device"] = argv["td_device"]
  testdroid_wd_config["testdroid_app"] = caps.app
  caps = push(caps, testdroid_wd_config)
}
else {
  caps = push(caps, local_wd_config)
}

if(platform == 'ios') {
  if(argv["udid"]) {
    caps["udid"] = argv["udid"];
    caps["deviceName"] = "ios";
  }else{
    delete caps["udid"];
    caps["deviceName"] = "iPhone Simulator";
  }
}

console.log(JSON.stringify(caps));
process.exit(0)
